export default function BankLogo({ bankName, size = 24 }) {
    const bankDomains = {
        'HDFC Bank': 'hdfcbank.com',
        'ICICI Bank': 'icicibank.com',
        'SBI Card': 'sbicard.com',
        'Axis Bank': 'axisbank.com',
        'American Express': 'americanexpress.com',
        'Kotak Mahindra Bank': 'kotak.com',
        'Yes Bank': 'yesbank.in',
        'RBL Bank': 'rblbank.com',
        'IndusInd Bank': 'indusind.com',
        'IDFC First Bank': 'idfcfirstbank.com',
        'AU Small Finance Bank': 'aubank.in',
        'Standard Chartered': 'sc.com',
        'Citibank': 'citi.com',
        'HSBC': 'hsbc.co.in',
        'Bank of Baroda': 'bankofbaroda.in',
        'Federal Bank': 'federalbank.co.in',
        'OneCard': 'getonecard.app',
        'Fi Money': 'fi.money',
        'Bajaj Finserv': 'bajajfinserv.in'
    };

    const domain = bankDomains[bankName];

    if (!domain) {
        return <span style={{ fontSize: `${size > 20 ? size - 4 : size}px`, lineHeight: 1 }}>🏦</span>;
    }

    // Using Google Favicon API for stable, high-quality logos
    const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <img 
                src={logoUrl} 
                alt={`${bankName} logo`} 
                width={size} 
                height={size}
                style={{ 
                    borderRadius: '4px', 
                    objectFit: 'contain',
                    background: 'white',
                    padding: '2px',
                    display: 'block'
                }}
                onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'inline-block';
                    }
                }}
            />
            <span style={{ display: 'none', fontSize: `${size > 20 ? size - 4 : size}px`, lineHeight: 1 }}>🏦</span>
        </span>
    );
}
