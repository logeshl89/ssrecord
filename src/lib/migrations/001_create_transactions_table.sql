-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('Purchase', 'Sale')),
    date DATE NOT NULL,
    party VARCHAR(255) NOT NULL,
    items TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    bill_date VARCHAR(20) NOT NULL,
    bill_number VARCHAR(50) NOT NULL,
    month VARCHAR(20) NOT NULL,
    amount_with_gst DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_month ON transactions(month);
CREATE INDEX IF NOT EXISTS idx_transactions_party ON transactions(party);
CREATE INDEX IF NOT EXISTS idx_transactions_bill_number ON transactions(bill_number);

-- Create a sequence table for auto-generating bill numbers
CREATE TABLE IF NOT EXISTS bill_number_sequences (
    year INTEGER PRIMARY KEY,
    last_purchase_number INTEGER DEFAULT 0,
    last_sale_number INTEGER DEFAULT 0
);