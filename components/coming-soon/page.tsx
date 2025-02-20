import Image from 'next/image';
import Link from 'next/link';
import LogoImg from "../../../public/images/logo.webp";


export default function ComingSoon() {
    return (
        <div style={{
            background: 'linear-gradient(to bottom, #ffffff, #f0f2f5)',
            color: '#1a1e26',
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center',
            padding: '50px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}>
            {/* <Image src={LogoImg} alt="Logo" width={150} height={150} style={{ marginBottom: '20px' }} /> */}
            <h1 style={{ fontSize: '2.5em', color: '#1a1e26' }}>We're Launching Soon</h1>
            <p style={{ fontSize: '1.2em', color: '#4a5568' }}>Our team is working hard to bring you something amazing. Stay tuned!</p>
            <Link href="/" style={{
                backgroundColor: '#1a1e26',
                color: 'white',
                padding: '12px 25px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontSize: '1em',
                marginTop: '20px',
                display: 'inline-block'
            }}>
                Back to Home
            </Link>
        </div>
    );
}
