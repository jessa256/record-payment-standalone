<template>
  <div class="ww-record-payment-popup">
    <!-- Trigger Button -->
    <button @click="showPopup" class="record-payment-trigger-btn" :style="buttonStyles">
      {{ content.buttonText || 'Record Payment' }}
    </button>

    <!-- Payment Record Creation Popup -->
    <div v-if="isPopupVisible" class="popup-overlay" @click="handleBackdropClick">
      <div class="popup-container" @click.stop>
        <div class="popup-header">
          <h2>{{ content.title || 'Record Payment' }}</h2>
          <button class="close-btn" @click="hidePopup" :style="closeButtonStyles">×</button>
        </div>

        <div class="popup-content">
          <form @submit.prevent="submitPayment" class="payment-form">
            
            <!-- Vendor Selection Dropdown - FIXED -->
            <div class="form-group">
              <label class="required-label">
                {{ content.vendorLabel || 'Vendor' }}
                <span class="required-asterisk" :style="{ color: content.requiredFieldColor || '#dc3545' }">*</span>
              </label>
              <select 
                v-model="paymentData.vendor" 
                required 
                :class="{ 'error': validationErrors.vendor }"
                @change="onVendorChange"
                :style="validationErrors.vendor ? { borderColor: content.errorBorderColor || '#dc3545' } : {}">
                
                <option value="">{{ content.vendorPlaceholder || 'Select a vendor...' }}</option>
                
                <option 
                  v-for="vendor in vendorOptions" 
                  :key="vendor.id || vendor.vendor_name" 
                  :value="vendor.vendor_name">
                  {{ vendor.vendor_name }}
                  <span v-if="content.showAmountInDropdown && vendor.quoted_amount">
                    - ${{ formatCurrency(vendor.quoted_amount) }}
                  </span>
                </option>
              </select>
              
              <div v-if="validationErrors.vendor" class="error-message" :style="{ color: content.errorTextColor || '#dc3545' }">
                {{ validationErrors.vendor }}
              </div>
            </div>

            <!-- Selected Vendor Information Display -->
            <div v-if="selectedVendorInfo" class="selected-vendor-info">
              <h4>{{ selectedVendorInfo.vendor_name }}</h4>
              <p><strong>Total Amount:</strong> ${{ formatCurrency(selectedVendorInfo.quoted_amount) }}</p>
              <p class="amount-remaining" :style="{ color: content.amountRemainingColor || '#28a745' }">
                <strong>Amount Remaining:</strong> ${{ formatCurrency(calculatedAmountRemaining) }}
              </p>
            </div>

            <!-- Invoice/Reference Number -->
            <div class="form-group">
              <label>{{ content.invoiceLabel || 'Invoice/Reference #' }}</label>
              <input 
                type="text" 
                v-model="paymentData.invoice" 
                :placeholder="content.invoicePlaceholder || 'Optional invoice or reference number'">
            </div>

            <!-- Payment Amount -->
            <div class="form-group">
              <label class="required-label">
                {{ content.amountLabel || 'Payment Amount' }}
                <span class="required-asterisk" :style="{ color: content.requiredFieldColor || '#dc3545' }">*</span>
              </label>
              <input 
                type="number" 
                step="0.01" 
                min="0.01" 
                v-model="paymentData.amount" 
                required 
                :class="{ 'error': validationErrors.amount }"
                :style="validationErrors.amount ? { borderColor: content.errorBorderColor || '#dc3545' } : {}"
                :placeholder="content.amountPlaceholder || 'Enter payment amount'">
              
              <div v-if="validationErrors.amount" class="error-message" :style="{ color: content.errorTextColor || '#dc3545' }">
                {{ validationErrors.amount }}
              </div>
              
              <div v-if="selectedVendorInfo && calculatedAmountRemaining > 0" class="helper-text" :style="{ color: content.helperTextColor || '#6c757d' }">
                {{ content.amountHelperText || `Maximum: $${formatCurrency(calculatedAmountRemaining)}` }}
              </div>
            </div>

            <!-- Payment Type -->
            <div class="form-group">
              <label class="required-label">
                {{ content.typeLabel || 'Payment Type' }}
                <span class="required-asterisk" :style="{ color: content.requiredFieldColor || '#dc3545' }">*</span>
              </label>
              <select 
                v-model="paymentData.type" 
                required 
                :class="{ 'error': validationErrors.type }"
                :style="validationErrors.type ? { borderColor: content.errorBorderColor || '#dc3545' } : {}">
                
                <option value="">{{ content.typePlaceholder || 'Select payment type...' }}</option>
                <option value="immediate">{{ content.immediateLabel || 'Immediate (today)' }}</option>
                <option value="historical">{{ content.historicalLabel || 'Historical (past date)' }}</option>
                <option value="scheduled">{{ content.scheduledLabel || 'Scheduled (future date)' }}</option>
              </select>
              
              <div v-if="validationErrors.type" class="error-message" :style="{ color: content.errorTextColor || '#dc3545' }">
                {{ validationErrors.type }}
              </div>
            </div>

            <!-- Payment Date (for historical payments) -->
            <div v-if="paymentData.type === 'historical'" class="form-group">
              <label class="required-label">
                {{ content.dateLabel || 'Payment Date' }}
                <span class="required-asterisk" :style="{ color: content.requiredFieldColor || '#dc3545' }">*</span>
              </label>
              <input 
                type="date" 
                v-model="paymentData.date" 
                :max="todayDate" 
                required>
            </div>

            <!-- Scheduled Date (for scheduled payments) -->
            <div v-if="paymentData.type === 'scheduled'" class="form-group">
              <label class="required-label">
                {{ content.scheduledDateLabel || 'Scheduled Date' }}
                <span class="required-asterisk" :style="{ color: content.requiredFieldColor || '#dc3545' }">*</span>
              </label>
              <input 
                type="date" 
                v-model="paymentData.scheduledDate" 
                :min="todayDate" 
                required>
            </div>

            <!-- Payment Method -->
            <div class="form-group">
              <label class="required-label">
                {{ content.methodLabel || 'Payment Method' }}
                <span class="required-asterisk" :style="{ color: content.requiredFieldColor || '#dc3545' }">*</span>
              </label>
              <input 
                type="text" 
                v-model="paymentData.method" 
                required 
                :class="{ 'error': validationErrors.method }"
                :style="validationErrors.method ? { borderColor: content.errorBorderColor || '#dc3545' } : {}"
                :placeholder="content.methodPlaceholder || 'e.g., Check #1234, ACH, Wire Transfer'">
              
              <div v-if="validationErrors.method" class="error-message" :style="{ color: content.errorTextColor || '#dc3545' }">
                {{ validationErrors.method }}
              </div>
            </div>

            <!-- Payment Reference -->
            <div class="form-group">
              <label>{{ content.referenceLabel || 'Payment Reference' }}</label>
              <input 
                type="text" 
                v-model="paymentData.reference" 
                :placeholder="content.referencePlaceholder || 'Optional payment reference'">
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label>{{ content.notesLabel || 'Notes' }}</label>
              <textarea 
                v-model="paymentData.notes" 
                rows="3" 
                :placeholder="content.notesPlaceholder || 'Optional notes about this payment'">
              </textarea>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" @click="hidePopup" class="cancel-btn" :style="cancelButtonStyles">
                {{ content.cancelText || 'Cancel' }}
              </button>
              <button type="submit" :disabled="!isFormValid || isProcessing" class="submit-btn" :style="submitButtonStyles">
                {{ isProcessing ? (content.processingText || 'Processing...') : getSubmitButtonText() }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    content: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data: function() {
    return {
      isPopupVisible: false,
      isProcessing: false,
      paymentData: {
        vendor: '',
        invoice: '',
        amount: null,
        type: '',
        date: '',
        scheduledDate: '',
        method: '',
        reference: '',
        notes: ''
      },
      validationErrors: {},
      selectedVendorInfo: null,
      calculatedAmountRemaining: 0
    }
  },
  computed: {
    // Get vendor options from WeWeb binding - SAFE
    vendorOptions: function() {
      var options = this.content.vendorOptions || []
      // Filter out any invalid vendor records
      return options.filter(function(vendor) {
        return vendor && vendor.vendor_name
      })
    },
    
    todayDate: function() {
      return new Date().toISOString().split('T')[0]
    },
    
    isFormValid: function() {
      return (
        this.paymentData.vendor &&
        this.paymentData.amount && 
        this.paymentData.amount > 0 &&
        this.paymentData.type &&
        this.paymentData.method &&
        this.paymentData.method.trim().length > 0
      )
    },
    
    buttonStyles: function() {
      return {
        backgroundColor: this.content.buttonBackgroundColor || '#007bff',
        color: this.content.buttonTextColor || '#ffffff',
        borderRadius: this.content.buttonBorderRadius || '4px',
        padding: this.content.buttonPadding || '10px 20px',
        fontSize: this.content.buttonFontSize || '14px',
        fontWeight: this.content.buttonFontWeight || '500',
        border: 'none',
        cursor: 'pointer'
      }
    },
    
    cancelButtonStyles: function() {
      return {
        backgroundColor: this.content.cancelButtonBackgroundColor || '#6c757d',
        color: this.content.cancelButtonTextColor || '#ffffff',
        borderRadius: this.content.buttonBorderRadius || '4px',
        padding: this.content.buttonPadding || '10px 20px',
        fontSize: this.content.buttonFontSize || '14px',
        border: 'none',
        cursor: 'pointer'
      }
    },
    
    submitButtonStyles: function() {
      return {
        backgroundColor: this.content.submitButtonBackgroundColor || '#28a745',
        color: this.content.submitButtonTextColor || '#ffffff',
        borderRadius: this.content.buttonBorderRadius || '4px',
        padding: this.content.buttonPadding || '10px 20px',
        fontSize: this.content.buttonFontSize || '14px',
        border: 'none',
        cursor: 'pointer'
      }
    },
    
    closeButtonStyles: function() {
      return {
        color: this.content.closeButtonColor || '#000000',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer'
      }
    }
  },
  methods: {
    showPopup: function() {
      this.isPopupVisible = true
      this.$emit('trigger-event', {
        name: 'modal-opened',
        event: {}
      })
    },
    
    hidePopup: function() {
      this.isPopupVisible = false
      this.resetForm()
      this.$emit('trigger-event', {
        name: 'modal-closed',
        event: {}
      })
    },
    
    handleBackdropClick: function() {
      this.hidePopup()
    },
    
    resetForm: function() {
      this.paymentData = {
        vendor: '',
        invoice: '',
        amount: null,
        type: '',
        date: '',
        scheduledDate: '',
        method: '',
        reference: '',
        notes: ''
      }
      this.validationErrors = {}
      this.selectedVendorInfo = null
      this.calculatedAmountRemaining = 0
      this.isProcessing = false
    },
    
    // FIXED: Vendor selection method - no more DOM events
    onVendorChange: function() {
      var selectedVendorName = this.paymentData.vendor
      var selectedVendor = this.vendorOptions.find(function(vendor) {
        return vendor.vendor_name === selectedVendorName
      })
      
      if (selectedVendor) {
        this.selectedVendorInfo = {
          id: selectedVendor.id,
          vendor_name: selectedVendor.vendor_name,
          quoted_amount: parseFloat(selectedVendor.quoted_amount) || 0
        }
        
        // Use calculated amount remaining from WeWeb binding if available
        this.calculatedAmountRemaining = this.content.calculatedAmountRemaining || this.selectedVendorInfo.quoted_amount || 0
        
        // Emit vendor selection event
        this.$emit('trigger-event', {
          name: 'vendor-selected',
          event: {
            vendorInfo: this.selectedVendorInfo,
            vendorName: this.paymentData.vendor,
            vendorId: this.selectedVendorInfo.id,
            quotedAmount: this.selectedVendorInfo.quoted_amount
          }
        })
        
        // Emit amount remaining update event
        this.$emit('trigger-event', {
          name: 'amount-remaining-updated',
          event: {
            amountRemaining: this.calculatedAmountRemaining,
            vendorId: this.selectedVendorInfo.id
          }
        })
      } else {
        this.selectedVendorInfo = null
        this.calculatedAmountRemaining = 0
      }
    },
    
    validateForm: function() {
      this.validationErrors = {}
      
      if (!this.paymentData.vendor) {
        this.validationErrors.vendor = 'Vendor selection is required'
      }
      
      if (!this.paymentData.amount || this.paymentData.amount <= 0) {
        this.validationErrors.amount = 'Payment amount is required and must be greater than 0'
      } else if (this.calculatedAmountRemaining > 0 && this.paymentData.amount > this.calculatedAmountRemaining) {
        this.validationErrors.amount = 'Payment amount cannot exceed remaining balance of $' + this.formatCurrency(this.calculatedAmountRemaining)
      }
      
      if (!this.paymentData.type) {
        this.validationErrors.type = 'Payment type is required'
      }
      
      if (!this.paymentData.method || this.paymentData.method.trim().length === 0) {
        this.validationErrors.method = 'Payment method is required'
      }
      
      return Object.keys(this.validationErrors).length === 0
    },
    
    submitPayment: function() {
      var self = this
      
      if (!this.validateForm()) {
        this.$emit('trigger-event', {
          name: 'validation-failed',
          event: {
            errors: this.validationErrors
          }
        })
        return
      }
      
      this.isProcessing = true
      
      var paymentDate = this.paymentData.type === 'immediate' ? this.todayDate : 
                       this.paymentData.type === 'historical' ? this.paymentData.date : 
                       this.paymentData.scheduledDate
      
      var paymentRecord = {
        vendor: this.paymentData.vendor,
        vendorId: this.selectedVendorInfo ? this.selectedVendorInfo.id : null,
        vendorName: this.paymentData.vendor,
        invoice: this.paymentData.invoice,
        amount: parseFloat(this.paymentData.amount),
        type: this.paymentData.type,
        date: paymentDate,
        scheduledDate: this.paymentData.type === 'scheduled' ? this.paymentData.scheduledDate : null,
        method: this.paymentData.method,
        reference: this.paymentData.reference,
        notes: this.paymentData.notes,
        totalAmount: this.selectedVendorInfo ? this.selectedVendorInfo.quoted_amount : 0,
        amountRemaining: Math.max(0, this.calculatedAmountRemaining - parseFloat(this.paymentData.amount)),
        timestamp: new Date().toISOString()
      }
      
      this.$emit('trigger-event', {
        name: 'payment-submitted',
        event: {
          paymentData: paymentRecord,
          vendorInfo: this.selectedVendorInfo,
          paymentType: this.paymentData.type
        }
      })
      
      setTimeout(function() {
        self.isProcessing = false
        self.hidePopup()
      }, 1000)
    },
    
    getSubmitButtonText: function() {
      if (this.paymentData.type === 'immediate') {
        return this.content.submitImmediateText || 'Record Payment'
      } else if (this.paymentData.type === 'historical') {
        return this.content.submitHistoricalText || 'Record Historical Payment'
      } else if (this.paymentData.type === 'scheduled') {
        return this.content.submitScheduledText || 'Schedule Payment'
      }
      return this.content.submitText || 'Submit Payment'
    },
    
    formatCurrency: function(amount) {
      if (amount == null || isNaN(amount)) return '0.00'
      return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  }
}
</script>

<style scoped>
.ww-record-payment-popup {
  display: inline-block;
}

.record-payment-trigger-btn {
  transition: opacity 0.2s ease;
}

.record-payment-trigger-btn:hover {
  opacity: 0.9;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.popup-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.popup-content {
  padding: 20px;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.required-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-asterisk {
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.15s ease-in-out;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-group input.error,
.form-group select.error {
  border-color: #dc3545;
}

.error-message {
  font-size: 12px;
  margin-top: 4px;
}

.helper-text {
  font-size: 12px;
  margin-top: 4px;
}

.selected-vendor-info {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  border-left: 3px solid #007bff;
  padding: 16px;
  margin-bottom: 10px;
}

.selected-vendor-info h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}

.selected-vendor-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.amount-remaining {
  font-weight: 600;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.cancel-btn,
.submit-btn {
  transition: opacity 0.2s ease;
}

.cancel-btn:hover,
.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .popup-container {
    width: 95%;
    margin: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>