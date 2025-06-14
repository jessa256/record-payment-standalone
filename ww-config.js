export default {
  editor: {
    label: 'Record Payment Standalone v1.0.1',
    icon: 'payment'
  },
  inherit: {
    type: 'ww-text',
    values: {
      text: {
        en: 'Record Payment'
      }
    }
  },
  properties: {
    // Button text
    buttonText: {
      label: {
        en: 'Button Text'
      },
      type: 'Text',
      options: {
        placeholder: 'Enter button text'
      },
      defaultValue: 'Record Payment',
      bindable: true
    },
    
    // Modal title
    title: {
      label: {
        en: 'Modal Title'
      },
      type: 'Text',
      options: {
        placeholder: 'Enter modal title'
      },
      defaultValue: 'Record Payment',
      bindable: true
    },

    // Vendor options dropdown data
    vendorOptions: {
      label: {
        en: 'Vendor Options (from Supabase)'
      },
      type: 'Info',
      section: 'settings',
      options: {
        text: 'Bind this to a WeWeb collection containing vendor data with fields: id, vendor_name, quoted_amount'
      },
      bindable: true,
      defaultValue: []
    },

    // Amount remaining calculation (from WeWeb workflow/variable)
    calculatedAmountRemaining: {
      label: {
        en: 'Amount Remaining (calculated)'
      },
      type: 'Number',
      section: 'settings',
      options: {
        placeholder: 'Bind to WeWeb variable/workflow result'
      },
      bindable: true,
      defaultValue: 0
    },

    // Vendor dropdown labels
    vendorLabel: {
      label: {
        en: 'Vendor Label'
      },
      type: 'Text',
      defaultValue: 'Vendor',
      bindable: true
    },

    vendorPlaceholder: {
      label: {
        en: 'Vendor Placeholder'
      },
      type: 'Text',
      defaultValue: 'Select a vendor',
      bindable: true
    },

    // Form field labels (editable in the editor)
    invoiceLabel: {
      label: {
        en: 'Invoice Label'
      },
      type: 'Text',
      defaultValue: 'Invoice/Reference Number',
      bindable: true
    },

    invoicePlaceholder: {
      label: {
        en: 'Invoice Placeholder'
      },
      type: 'Text',
      defaultValue: 'Enter invoice or reference number',
      bindable: true
    },

    paymentAmountLabel: {
      label: {
        en: 'Payment Amount Label'
      },
      type: 'Text',
      defaultValue: 'Payment Amount',
      bindable: true
    },

    amountRemainingPlaceholder: {
      label: {
        en: 'Amount Placeholder'
      },
      type: 'Text',
      defaultValue: 'Enter payment amount',
      bindable: true
    },

    amountRemainingHelper: {
      label: {
        en: 'Amount Helper Text'
      },
      type: 'Text',
      defaultValue: 'Enter the amount you want to pay now',
      bindable: true
    },

    paymentTypeLabel: {
      label: {
        en: 'Payment Type Label'
      },
      type: 'Text',
      defaultValue: 'Payment Type',
      bindable: true
    },

    immediatePaymentText: {
      label: {
        en: 'Immediate Payment Text'
      },
      type: 'Text',
      defaultValue: 'Immediate Payment',
      bindable: true
    },

    historicalPaymentText: {
      label: {
        en: 'Historical Payment Text'
      },
      type: 'Text',
      defaultValue: 'Historical Payment',
      bindable: true
    },

    scheduledPaymentText: {
      label: {
        en: 'Scheduled Payment Text'
      },
      type: 'Text',
      defaultValue: 'Scheduled Payment',
      bindable: true
    },

    paymentDateLabel: {
      label: {
        en: 'Payment Date Label'
      },
      type: 'Text',
      defaultValue: 'Payment Date',
      bindable: true
    },

    paymentDateHelper: {
      label: {
        en: 'Payment Date Helper Text'
      },
      type: 'Text',
      defaultValue: 'When was this payment made?',
      bindable: true
    },

    scheduledDateLabel: {
      label: {
        en: 'Scheduled Date Label'
      },
      type: 'Text',
      defaultValue: 'Scheduled Date',
      bindable: true
    },

    scheduledDateHelper: {
      label: {
        en: 'Scheduled Date Helper Text'
      },
      type: 'Text',
      defaultValue: 'When should this payment be processed?',
      bindable: true
    },

    paymentMethodLabel: {
      label: {
        en: 'Payment Method Label'
      },
      type: 'Text',
      defaultValue: 'Payment Method',
      bindable: true
    },

    paymentMethodPlaceholder: {
      label: {
        en: 'Payment Method Placeholder'
      },
      type: 'Text',
      defaultValue: 'e.g., Credit Card, Bank Transfer, Check',
      bindable: true
    },

    paymentReferenceLabel: {
      label: {
        en: 'Payment Reference Label'
      },
      type: 'Text',
      defaultValue: 'Payment Reference',
      bindable: true
    },

    notesLabel: {
      label: {
        en: 'Notes Label'
      },
      type: 'Text',
      defaultValue: 'Notes (Optional)',
      bindable: true
    },

    notesPlaceholder: {
      label: {
        en: 'Notes Placeholder'
      },
      type: 'Text',
      defaultValue: 'Add any additional notes about this payment',
      bindable: true
    },

    cancelButtonText: {
      label: {
        en: 'Cancel Button Text'
      },
      type: 'Text',
      defaultValue: 'Cancel',
      bindable: true
    },

    processingText: {
      label: {
        en: 'Processing Text'
      },
      type: 'Text',
      defaultValue: 'Processing...',
      bindable: true
    },

    immediateSubmitText: {
      label: {
        en: 'Immediate Submit Button Text'
      },
      type: 'Text',
      defaultValue: 'Process Payment',
      bindable: true
    },

    historicalSubmitText: {
      label: {
        en: 'Historical Submit Button Text'
      },
      type: 'Text',
      defaultValue: 'Record Payment',
      bindable: true
    },

    scheduledSubmitText: {
      label: {
        en: 'Scheduled Submit Button Text'
      },
      type: 'Text',
      defaultValue: 'Schedule Payment',
      bindable: true
    },

    // Styling options for required fields
    requiredFieldColor: {
      label: {
        en: 'Required Asterisk Color'
      },
      type: 'Color',
      defaultValue: '#dc3545',
      bindable: true
    },

    errorBorderColor: {
      label: {
        en: 'Error Border Color'
      },
      type: 'Color',
      defaultValue: '#dc3545',
      bindable: true
    },

    amountRemainingColor: {
      label: {
        en: 'Amount Remaining Color'
      },
      type: 'Color',
      defaultValue: '#28a745',
      bindable: true
    },

    // Button styling
    buttonBackgroundColor: {
      label: {
        en: 'Button Background Color'
      },
      type: 'Color',
      defaultValue: '#007bff',
      bindable: true
    },

    buttonTextColor: {
      label: {
        en: 'Button Text Color'
      },
      type: 'Color',
      defaultValue: '#ffffff',
      bindable: true
    },

    buttonBorderRadius: {
      label: {
        en: 'Button Border Radius'
      },
      type: 'Text',
      defaultValue: '4px',
      bindable: true
    },

    buttonPadding: {
      label: {
        en: 'Button Padding'
      },
      type: 'Text',
      defaultValue: '10px 20px',
      bindable: true
    },

    buttonFontSize: {
      label: {
        en: 'Button Font Size'
      },
      type: 'Text',
      defaultValue: '14px',
      bindable: true
    },

    buttonFontWeight: {
      label: {
        en: 'Button Font Weight'
      },
      type: 'Text',
      defaultValue: '500',
      bindable: true
    },

    cancelButtonBackgroundColor: {
      label: {
        en: 'Cancel Button Background Color'
      },
      type: 'Color',
      defaultValue: '#6c757d',
      bindable: true
    },

    cancelButtonTextColor: {
      label: {
        en: 'Cancel Button Text Color'
      },
      type: 'Color',
      defaultValue: '#ffffff',
      bindable: true
    },

    submitButtonBackgroundColor: {
      label: {
        en: 'Submit Button Background Color'
      },
      type: 'Color',
      defaultValue: '#28a745',
      bindable: true
    },

    submitButtonTextColor: {
      label: {
        en: 'Submit Button Text Color'
      },
      type: 'Color',
      defaultValue: '#ffffff',
      bindable: true
    },

    closeButtonColor: {
      label: {
        en: 'Close Button Color'
      },
      type: 'Color',
      defaultValue: '#000000',
      bindable: true
    }
  },

  triggerEvents: [
    {
      name: 'payment-submitted',
      label: { en: 'On payment submitted' },
      event: {
        paymentData: {},
        vendorInfo: {},
        paymentType: ''
      }
    },
    {
      name: 'payment-cancelled',
      label: { en: 'On payment cancelled' },
      event: {}
    },
    {
      name: 'modal-opened',
      label: { en: 'On modal opened' },
      event: {}
    },
    {
      name: 'modal-closed',
      label: { en: 'On modal closed' },
      event: {}
    },
    {
      name: 'validation-failed',
      label: { en: 'On validation failed' },
      event: {
        errors: {}
      }
    },
    {
      name: 'vendor-selected',
      label: { en: 'On vendor selected' },
      event: {
        vendorInfo: {},
        vendorName: ''
      }
    },
    {
      name: 'amount-remaining-updated',
      label: { en: 'On amount remaining updated' },
      event: {
        amountRemaining: 0,
        vendorId: ''
      }
    }
  ]
};