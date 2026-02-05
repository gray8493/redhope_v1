import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Link,
    Img,
} from '@react-email/components';
import * as React from 'react';

interface DonationSuccessEmailProps {
    donorName: string;
    hospitalName: string;
    volumeMl: number;
    pointsEarned: number;
}

export const DonationSuccessEmail = ({
    donorName = 'Người hiến máu',
    hospitalName = 'Bệnh viện',
    volumeMl = 350,
    pointsEarned = 100,
}: DonationSuccessEmailProps) => (
    <Html>
        <Head />
        <Preview>Cảm ơn sự đóng góp quý báu của bạn - Một nghĩa cử cao đẹp!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Heading style={h1}>🩸 Chúc mừng bạn đã hiến máu thành công!</Heading>
                </Section>
                <Section style={section}>
                    <Text style={text}>Chào <strong>{donorName}</strong>,</Text>
                    <Text style={text}>
                        Thay mặt tập thể <strong>{hospitalName}</strong> và cộng đồng <strong>RedHope</strong>, chúng tôi xin gửi lời cảm ơn chân thành nhất đến bạn. Sự đóng góp của bạn hôm nay là nguồn sống quý báu cho những bệnh nhân đang cần giúp đỡ.
                    </Text>

                    <Section style={statsContainer}>
                        <Text style={statsHeader}>Thông tin buổi hiến máu:</Text>
                        <Text style={statsItem}>• Lượng máu hiến: <strong>{volumeMl} ml</strong></Text>
                        <Text style={statsItem}>• Điểm thưởng tích lũy: <strong style={{ color: '#6324eb' }}>+{pointsEarned} pts</strong></Text>
                    </Section>

                    <Text style={text}>
                        Nghĩa cử cao đẹp của bạn không chỉ cứu sống một mạng người mà còn lan tỏa giá trị nhân văn sâu sắc tới cộng đồng. Bạn đã chính thức trở thành một <strong>"Anh hùng thầm lặng"</strong> của hệ thống RedHope.
                    </Text>

                    <Hr style={hr} />

                    <Text style={footerText}>
                        Bạn có thể kiểm tra lịch sử hiến máu và đổi các phần quà tri ân tại ứng dụng RedHope của chúng tôi.
                    </Text>

                    <Section style={btnContainer}>
                        <Link style={button} href="https://redhope.vn/rewards">
                            Đổi quà tặng ngay
                        </Link>
                    </Section>
                </Section>

                <Text style={footer}>
                    RedHope Team • Kết nối sự sống từ trái tim
                </Text>
            </Container>
        </Body>
    </Html>
);

export default DonationSuccessEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
};

const header = {
    padding: '32px',
    textAlign: 'center' as const,
    backgroundColor: '#fee2e2',
};

const h1 = {
    color: '#dc2626',
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '32px',
    margin: '0',
};

const section = {
    padding: '0 32px',
};

const text = {
    color: '#4b5563',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'left' as const,
};

const statsContainer = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
    margin: '24px 0',
    border: '1px solid #e5e7eb',
};

const statsHeader = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
};

const statsItem = {
    fontSize: '15px',
    color: '#4b5563',
    margin: '4px 0',
};

const button = {
    backgroundColor: '#6324eb',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '200px',
    padding: '12px 0',
    margin: '0 auto',
};

const btnContainer = {
    textAlign: 'center' as const,
    marginTop: '32px',
};

const hr = {
    borderColor: '#e5e7eb',
    margin: '32px 0',
};

const footerText = {
    color: '#6b7280',
    fontSize: '14px',
    fontStyle: 'italic',
};

const footer = {
    color: '#9ca3af',
    fontSize: '12px',
    textAlign: 'center' as const,
    marginTop: '32px',
};
