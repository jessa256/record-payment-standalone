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
            <!-- Vendor Selection Dropdown -->
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
                :style="validationErrors.vendor ? { borderColor: content.errorBorderColor || '#dc3545' } : {}"
              >
                <option value="">{{ content.vendorPlaceholder || 'Select a vendor' }}</option>
                <option 
                  v-for="vendor in vendorOptions" 
                  :key="vendor.id" 
                  :value="vendor.vendor_name"
                  :data-quoted-amount="vendor.quoted_amount"
                  :data-vendor-id="vendor.id"
                >
                  {{ vendor.vendor_name }}
                </option>
              </select>
              <div v-if="validationErrors.vendor" class="error-message">{{ validationErrors.vendor }}</div>
            </div>

            <!-- Selected Vendor Information Display -->
            <div v-if="selectedVendorInfo" class="selected-vendor-info">
              <div class="info-row">
                <span class="label">Total Quote:</span>
                <span class="value">${{ formatCurrency(selectedVendorInfo.quoted_amount || 0) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Amount Remaining:</span>
                <span class="value remaining-amount" 
                      :class="{ 'fully-paid': calculatedAmountRemaining <= 0 }"
                      :style="{ color: content.amountRemainingColor || '#28a745' }">
                  ${{ formatCurrency(calculatedAmountRemaining) }}
                </span>
              </div>
            </div>

            <!-- Invoice/Reference Number -->
            <div class="form-group">
              <label>{{ content.invoiceLabel || 'Invoice/Reference Number' }}</label>
              <input 
                v-model="paymentData.invoice" 
                type="text" 
                :placeholder="content.invoicePlaceholder || 'Enter invoice or reference number'"
              />
            </div>

            <!-- Payment Amount -->
            <div class="form-group">
              <label class="required-label">
                {{ content.paymentAmountLabel || 'Payment Amount' }}
                <span class="required-asterisk" :style="{ color: content.requiredFieldColor || '#dc3545' }">*</span>
              </label>
              <input 
                v-model.number="paymentData.amount" 
                type="number" 
                step="0.01" 
                min="0.01"
                :max="calculatedAmountRemaining > 0 ? calculatedAmountRemaining : undefined"
                :placeholder="content.amountRemainingPlaceholder || 'Enter payment amount'"
                required 
                :class="{ 'error': validationErrors.amount }"
                :style="validationErrors.amount ? { borderColor: content.errorBorderColor || '#dc3545' } : {}"
              />
              <small class="helper-text">{{ content.amountRemainingHelper || 'Enter the amount you want to pay now' }}</small>
              <div v-if="validationErrors.amount" class="error-message">{{ validationErrors.amount }}</div>
            </div>

            <!-- Payment Type -->
            <div class="form-group">
              <label class="required-label">
                {{ content.paymentTypeLabel || 'Payment Type' }}
                <span class="required-asterisk" :style="{ color: content.requiredFieldColor || '#dc3545' }">*</span>
              </label>
              <select v-model="paymentData.type" required 
                      :class="{ 'error': validationErrors.type }"
                      :style="validationErrors.type ? { borderColor: content.errorBorderColor || '#dc3545' } : {}">
                <option value="">Select payment type</option>
                <option value="immediate">{{ content.immediatePaymentText || 'Immediate Payment' }}</option>
                <option value="historical">{{ content.historicalPaymentText || 'Historical Payment' }}</option>
                <option value="scheduled">{{ content.scheduledPaymentText || 'Scheduled Payment' }}</option>
              </select>
              <div v-if="validationErrors.type" class="error-message">{{ validationErrors.type }}</div>
            </div>

            <!-- Payment Date (for historical payments) -->
            <div v-if="paymentData.type === 'historical'" class="form-group">
              <label class="required-label">
                {{ content.paymentDateLabel || 'Payment Date' }}
                <span class="required-asterisk" :style="{ color: content.requiredFieldColor || '#dc3545' }">*</span>
              </label>
              <input v-model="paymentData.date" type="date" :max="todayDate" required />
              <small class="helper-text">{{ content.paymentDateHelper || 'When was this payment made?' }}</small>
            </div>

            <!-- Scheduled Date (for scheduled payments) -->
            <div v-if="paymentData.type === 'scheduled'" class="form-group">
              <label class="required-label">
                {{ content.scheduledDateLabel || 'Scheduled Date' }}
                <span class="required-asterisk" :style="{ color: content.requiredFieldColor || '#dc3545' }">*</span>
              </label>
              <input v-model="paymentData.scheduledDate" type="date" :min="todayDate" required />
              <small class="helper-text">{{ content.scheduledDateHelper || 'When should this payment be processed?' }}</small>
            </div>

            <!-- Payment Method -->
            <div class="form-group">
              <label class="required-label">
                {{ content.paymentMethodLabel || 'Payment Method' }}
                <span class="required-asterisk" :style="{ color: content.requiredFieldColor || '#dc3545' }">*</span>
              </label>
              <input 
                v-model="paymentData.method" 
                type="text" 
                :placeholder="content.paymentMethodPlaceholder || 'e.g., Credit Card, Bank Transfer, Check'"
                required 
                :class="{ 'error': validationErrors.method }"
                :style="validationErrors.method ? { borderColor: content.errorBorderColor || '#dc3545' } : {}"
              />
              <div v-if="validationErrors.method" class="error-message">{{ validationErrors.method }}</div>
            </div>

            <!-- Payment Reference -->
            <div class="form-group">
              <label>{{ content.paymentReferenceLabel || 'Payment Reference' }}</label>
              <input v-model="paymentData.reference" type="text" />
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label>{{ content.notesLabel || 'Notes (Optional)' }}</label>
              <textarea 
                v-model="paymentData.notes" 
                :placeholder="content.notesPlaceholder || 'Add any additional notes about this payment'"
                rows="3"
              ></textarea>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" @click="hidePopup" class="cancel-btn" :style="cancelButtonStyles">
                {{ content.cancelButtonText || 'Cancel' }}
              </button>
              <button type="submit" :disabled="isProcessing || !isFormValid" class="submit-btn" :style="submitButtonStyles">
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
    // Get vendor options from WeWeb binding
    vendorOptions: function() {
      return this.content.vendorOptions || []
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
        fontWeight: this.content.buttonFontWeight || '500'
      }
    },
    cancelButtonStyles: function() {
      return {
        backgroundColor: this.content.cancelButtonBackgroundColor || '#6c757d',
        color: this.content.cancelButtonTextColor || '#ffffff'
      }
    },
    submitButtonStyles: function() {
      return {
        backgroundColor: this.content.submitButtonBackgroundColor || '#28a745',
        color: this.content.submitButtonTextColor || '#ffffff'
      }
    },
    closeButtonStyles: function() {
      return {
        color: this.content.closeButtonColor || '#000000'
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
    
    onVendorChange: function() {
      var selectedOption = event.target.selectedOptions[0]
      
      if (selectedOption && selectedOption.value) {
        // Get vendor info from the option data attributes
        this.selectedVendorInfo = {
          id: selectedOption.getAttribute('data-vendor-id'),
          vendor_name: selectedOption.value,
          quoted_amount: parseFloat(selectedOption.getAttribute('data-quoted-amount')) || 0
        }
        
        // Use the calculated amount remaining from WeWeb binding if available
        this.calculatedAmountRemaining = this.content.calculatedAmountRemaining || this.selectedVendorInfo.quoted_amount || 0
        
        // Emit event for vendor selection
        this.$emit('trigger-event', {
          name: 'vendor-selected',
          event: {
            vendorInfo: this.selectedVendorInfo,
            vendorName: this.paymentData.vendor
          }
        })
        
        // Emit event for amount remaining update
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
      
      if (!this.paymentData.vendor || this.paymentData.vendor.trim().length === 0) {
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
      
      var hasErrors = Object.keys(this.validationErrors).length > 0
      
      if (hasErrors) {
        this.$emit('trigger-event', {
          name: 'validation-failed',
          event: {
            errors: this.validationErrors
          }
        })
      }
      
      return !hasErrors
    },
    
    submitPayment: function() {
      var self = this
      
      if (!this.validateForm()) {
        return
      }
      
      this.isProcessing = true
      
      try {
        var submissionData = Object.assign({}, this.paymentData, {
          vendorId: this.selectedVendorInfo ? this.selectedVendorInfo.id : null,
          vendorName: this.paymentData.vendor,
          totalAmount: this.selectedVendorInfo ? this.selectedVendorInfo.quoted_amount : 0,
          amountRemaining: this.calculatedAmountRemaining,
          timestamp: new Date().toISOString()
        })

        this.$emit('trigger-event', {
          name: 'payment-submitted',
          event: {
            paymentData: submissionData,
            vendorInfo: this.selectedVendorInfo,
            paymentType: this.paymentData.type
          }
        })

        // Simulate processing delay
        setTimeout(function() {
          self.hidePopup()
          self.isProcessing = false
        }, 1000)
        
      } catch (error) {
        console.error('Error submitting payment:', error)
        this.isProcessing = false
      }
    },
    
    getSubmitButtonText: function() {
      switch (this.paymentData.type) {
        case 'immediate':
          return this.content.immediateSubmitText || 'Process Payment'
        case 'historical':
          return this.content.historicalSubmitText || 'Record Payment'
        case 'scheduled':
          return this.content.scheduledSubmitText || 'Schedule Payment'
        default:
          return 'Submit Payment'
      }
    },
    
    formatCurrency: function(amount) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }
  }
}
</script>

<style scoped>
.ww-record-payment-popup {
  display: inline-block;
}

.record-payment-trigger-btn {
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.record-payment-trigger-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
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
  z-index: 9999;
}

.popup-container {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.popup-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
}

.popup-content {
  padding: 20px;
}

.selected-vendor-info {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
  border-left: 4px solid #007bff;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  font-weight: 500;
  color: #6c757d;
  font-size: 0.9rem;
}

.info-row .value {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.remaining-amount {
  color: #28a745;
  font-weight: 700;
}

.remaining-amount.fully-paid {
  color: #6c757d;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.required-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-asterisk {
  color: #dc3545;
  font-weight: 600;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-group input.error,
.form-group select.error {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 2px;
}

.helper-text {
  color: #6c757d;
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.cancel-btn,
.submit-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  opacity: 0.9;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background-color: #6c757d !important;
}

@media (max-width: 768px) {
  .popup-container {
    width: 95%;
    margin: 10px;
  }
  
  .popup-header,
  .popup-content {
    padding: 15px;
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
