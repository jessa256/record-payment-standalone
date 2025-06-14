# Record Payment Standalone v1.0.0

A standalone WeWeb custom component for recording vendor payments with dropdown vendor selection. Based on the Payment Plan Component v3.1.2 but redesigned for independent use without parent component context.

## 🚀 Key Features

### **What's Different from Payment Plan Component v3.1.2:**
- ❌ **Removed**: Static vendor information section (grey box)
- ❌ **Removed**: Dependency on parent component context
- ❌ **Removed**: Pre-populated vendor data from props
- ✅ **Added**: Required vendor dropdown as first form field
- ✅ **Added**: Dynamic vendor selection from Supabase `vendorInformation` table
- ✅ **Added**: Compact vendor info display after selection
- ✅ **Added**: New events for vendor selection and amount calculations

### **Core Functionality:**
- **Vendor Selection**: Required dropdown populated from your `vendorInformation` table
- **Payment Recording**: Create immediate, historical, or scheduled payment records
- **Required Field Validation**: Vendor, Payment Amount, Payment Type, and Payment Method
- **Smart Payment Limits**: Payment amount cannot exceed remaining balance
- **Real-time Calculations**: Amount remaining updates based on vendor selection
- **Enhanced UX**: Visual indicators, error messages, and form validation

## 📋 Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Vendor** | Dropdown | ✅ | Select from existing vendors in database |
| **Invoice/Reference** | Text | ❌ | Optional invoice or reference number |
| **Payment Amount** | Number | ✅ | Cannot exceed remaining balance |
| **Payment Type** | Dropdown | ✅ | Immediate, Historical, or Scheduled |
| **Payment Date** | Date | ✅* | Required for Historical payments (≤ today) |
| **Scheduled Date** | Date | ✅* | Required for Scheduled payments (≥ today) |
| **Payment Method** | Text | ✅ | Free text (e.g., "Check", "ACH", "Wire") |
| **Payment Reference** | Text | ❌ | Optional payment reference |
| **Notes** | Textarea | ❌ | Optional additional notes |

## 🛠 Installation

### Method 1: Clone and Build
```bash
git clone https://github.com/Jessa256/record-payment-standalone.git
cd record-payment-standalone
npm install

# Build for WeWeb
npm run build
```

### Method 2: Development Setup
```bash
git clone https://github.com/Jessa256/record-payment-standalone.git
cd record-payment-standalone
npm install

# Start development server
npm run serve
```

## ⚙️ WeWeb Setup Guide

### 1. **Vendor Dropdown Configuration**

Bind the `vendorOptions` property to a WeWeb collection:

**Step 1: Create Supabase Collection**
- Collection Name: `vendorInformation`
- Query: `SELECT id, vendor_name, quoted_amount FROM vendorInformation ORDER BY vendor_name`

**Step 2: Bind to Component**
```javascript
// In WeWeb component properties:
vendorOptions: {{ collections.vendorInformation.data }}
```

**Required Data Structure:**
```javascript
[
  {
    "id": "uuid-123",
    "vendor_name": "ABC Construction",
    "quoted_amount": 15000.00
  },
  {
    "id": "uuid-456", 
    "vendor_name": "XYZ Plumbing",
    "quoted_amount": 8500.00
  }
]
```

### 2. **Amount Remaining Calculation**

#### Option A: WeWeb Workflow (Recommended)
1. **Create Workflow**: "Calculate Amount Remaining"
2. **Trigger**: Component Event → `vendor-selected`
3. **Actions**:
   - Query existing payments for selected vendor
   - Calculate: `quoted_amount - SUM(payment_amount WHERE paid = true)`
   - Set WeWeb variable: `amountRemaining`
4. **Bind Component**: `calculatedAmountRemaining` → `{{ variables.amountRemaining }}`

#### Option B: Supabase Function
Create a database function to calculate remaining amounts:

```sql
CREATE OR REPLACE FUNCTION get_vendor_amount_remaining(vendor_name_param TEXT)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_quoted DECIMAL(10,2);
    total_paid DECIMAL(10,2);
    amount_remaining DECIMAL(10,2);
BEGIN
    -- Get quoted amount
    SELECT COALESCE(quoted_amount, 0) INTO total_quoted
    FROM "vendorInformation" 
    WHERE vendor_name = vendor_name_param;
    
    -- Get total paid
    SELECT COALESCE(SUM(payment_amount), 0) INTO total_paid
    FROM "paymentPlans" 
    WHERE vendor = vendor_name_param 
    AND payment_date <= CURRENT_DATE
    AND paid = true;
    
    amount_remaining := total_quoted - total_paid;
    
    IF amount_remaining < 0 THEN
        amount_remaining := 0;
    END IF;
    
    RETURN amount_remaining;
END;
$$ LANGUAGE plpgsql;
```

### 3. **Payment Submission Workflow**

Create a WeWeb workflow to handle payment submissions:

**Workflow: "Record Payment Submission"**
1. **Trigger**: Component Event → `payment-submitted`
2. **Action**: Supabase Insert → `paymentPlans` table
3. **Data Mapping**:
```javascript
{
  vendor_id: {{ event.paymentData.vendorId }},
  vendor: {{ event.paymentData.vendorName }},
  invoice_reference: {{ event.paymentData.invoice }},
  payment_amount: {{ event.paymentData.amount }},
  payment_type: {{ event.paymentData.type }},
  payment_date: {{ event.paymentData.date || event.paymentData.scheduledDate }},
  payment_method: {{ event.paymentData.method }},
  payment_reference: {{ event.paymentData.reference }},
  notes: {{ event.paymentData.notes }},
  paid: {{ event.paymentData.type === 'immediate' || event.paymentData.type === 'historical' }}
}
```

## 📊 Database Schema

### Required Tables

```sql
-- Vendor Information Table
CREATE TABLE vendorInformation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_name TEXT NOT NULL UNIQUE,
  vendor_type TEXT,
  quoted_amount DECIMAL(10,2),
  contact_name TEXT,
  phone_number TEXT,
  email TEXT,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payment Plans Table  
CREATE TABLE paymentPlans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  vendor TEXT NOT NULL,
  invoice_reference TEXT,
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('immediate', 'historical', 'scheduled')),
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  notes TEXT,
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Sample Data

```sql
-- Insert sample vendors
INSERT INTO "vendorInformation" (vendor_name, vendor_type, quoted_amount, contact_name, email) VALUES
('ABC Construction', 'Contractor', 25000.00, 'John Smith', 'john@abcconstruction.com'),
('XYZ Plumbing', 'Plumber', 8500.00, 'Jane Doe', 'jane@xyzplumbing.com'),
('Elite Electrical', 'Electrician', 12000.00, 'Mike Johnson', 'mike@eliteelectrical.com');
```

## 📡 Component Events

### **vendor-selected**
Triggered when user selects a vendor from dropdown.
```javascript
{
  vendorInfo: {
    id: 'uuid-123',
    vendor_name: 'ABC Construction',
    quoted_amount: 15000.00
  },
  vendorName: 'ABC Construction'
}
```

### **amount-remaining-updated**
Triggered when amount remaining is calculated for selected vendor.
```javascript
{
  amountRemaining: 12500.00,
  vendorId: 'uuid-123'
}
```

### **payment-submitted**
Triggered when payment record is successfully submitted.
```javascript
{
  paymentData: {
    vendor: 'ABC Construction',
    vendorId: 'uuid-123',
    vendorName: 'ABC Construction',
    invoice: 'INV-001',
    amount: 2500.00,
    type: 'immediate',
    date: '2025-06-14',
    method: 'Check #1234',
    reference: 'CHECK-001',
    notes: 'First payment installment',
    totalAmount: 15000.00,
    amountRemaining: 10000.00,
    timestamp: '2025-06-14T10:30:00Z'
  },
  vendorInfo: {
    id: 'uuid-123',
    vendor_name: 'ABC Construction',
    quoted_amount: 15000.00
  },
  paymentType: 'immediate'
}
```

### **validation-failed**
Triggered when form validation fails.
```javascript
{
  errors: {
    vendor: 'Vendor selection is required',
    amount: 'Payment amount cannot exceed remaining balance of $12,500.00',
    type: 'Payment type is required',
    method: 'Payment method is required'
  }
}
```

### **modal-opened / modal-closed**
Triggered when the payment modal opens or closes.

## 🎨 Customization Options

### **Editable Labels**
All form labels and text can be customized in WeWeb:
- Vendor Label & Placeholder
- Invoice/Reference Label & Placeholder
- Payment Amount Label & Helper Text
- Payment Type Labels (Immediate, Historical, Scheduled)
- Payment Method Label & Placeholder
- Notes Label & Placeholder
- Button Text (Cancel, Submit variations, Processing)

### **Styling Properties**
- **Button Colors**: Background, text, hover states
- **Form Styling**: Border colors, focus states, error states
- **Required Field Indicators**: Red asterisk color
- **Amount Remaining Color**: Green color for balance display
- **Typography**: Font sizes, weights, colors

### **Required Field Validation**
The component enforces validation for:
- **Vendor Selection**: Must select a vendor from dropdown
- **Payment Amount**: Must be > 0 and ≤ remaining balance
- **Payment Type**: Must select immediate, historical, or scheduled
- **Payment Method**: Cannot be empty

## 🔧 Development

### **WeWeb CLI Commands**
```bash
# Start development server
npm run serve

# Build for production  
npm run build

# Check WeWeb CLI version
weweb --version
```

### **File Structure**
```
record-payment-standalone/
├── src/
│   └── wwElement.vue          # Main component file
├── ww-config.js               # WeWeb configuration
├── package.json               # Package configuration
├── README.md                  # This documentation
└── .gitignore                # Git ignore rules
```

## 🆚 Version Comparison

| Feature | Payment Plan v3.1.2 | Record Payment v1.0.0 |
|---------|---------------------|------------------------|
| **Vendor Info** | Static grey box (from context) | Dynamic dropdown selection |
| **Usage Context** | Inside vendor detail pages | Anywhere in application |
| **Vendor Field** | Read-only display | Required dropdown input |
| **Dependencies** | Parent component required | Fully standalone |
| **Component Name** | `payment-plan-popup` | `record-payment-popup` |
| **Default Button** | "Create Payment Plan" | "Record Payment" |

## 🐛 Troubleshooting

### **Vendor Dropdown Empty**
- Verify `vendorOptions` is bound to correct WeWeb collection
- Check Supabase collection includes: `id`, `vendor_name`, `quoted_amount`
- Ensure collection loads before component renders

### **Amount Remaining Not Updating**
- Verify `vendor-selected` event triggers WeWeb workflow
- Check workflow queries existing payments correctly
- Ensure `calculatedAmountRemaining` is bound to workflow result

### **Payment Submission Failing**
- Verify `payment-submitted` event handler is configured
- Check Supabase insert permissions for `paymentPlans` table
- Ensure all required fields are mapped correctly

### **Component Build Errors**
```bash
# Clean rebuild
rm -rf node_modules dist
npm install
npm run build
```

### **WeWeb Import Issues**
- Ensure component is built successfully
- Check WeWeb console for import errors
- Verify component registration in WeWeb project

## 📈 Future Enhancements

- [ ] **Vendor Search/Filter**: Type-ahead search in vendor dropdown
- [ ] **Payment Templates**: Save common payment configurations
- [ ] **Bulk Payment Import**: Import multiple payments from CSV
- [ ] **Payment History**: Show existing payments for selected vendor
- [ ] **Auto-calculation**: Smart payment amount suggestions
- [ ] **Recurring Payments**: Support for recurring payment schedules

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

- **GitHub Issues**: [Create an issue](https://github.com/Jessa256/record-payment-standalone/issues)
- **WeWeb Community**: [WeWeb Discord](https://discord.gg/weweb)
- **Email**: kjessicaclark1@live.com

## 🙏 Acknowledgments

- WeWeb team for the excellent no-code platform
- Supabase team for the backend infrastructure
- Vue.js community for the reactive framework
- Contributors and testers who helped improve this component

---

**Perfect for:** Admin dashboards, accounting interfaces, payment processing forms, and any standalone payment recording needs without vendor-specific context dependencies.

Made with ❤️ for WeWeb applications by Jessica Clark
