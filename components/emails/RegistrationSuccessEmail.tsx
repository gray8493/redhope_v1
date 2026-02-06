import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Row,
    Column,
} from '@react-email/components';
import * as React from 'react';

interface RegistrationSuccessEmailProps {
    donorName: string;
    campaignName: string;
    hospitalName: string;
    locationName: string;
    startTime: string;
    appointmentId?: string;
    message?: string;
}

export const RegistrationSuccessEmail = ({
    donorName,
    campaignName,
    hospitalName,
    locationName,
    startTime,
    appointmentId,
    message,
}: RegistrationSuccessEmailProps) => {
    const previewText = `Đăng ký thành công: ${campaignName}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Heading style={h1}>Đăng Ký Thành Công</Heading>
                    </Section>

                    <Section style={content}>
                        <Text style={paragraph}>Chào <strong>{donorName}</strong>,</Text>
                        <Text style={paragraph}>
                            Chúc mừng! Bạn đã đăng ký thành công tham gia chiến dịch hiến máu nhân đạo <strong>{campaignName}</strong>.
                            Sự đóng góp của bạn là món quà vô giá giúp cứu sống nhiều bệnh nhân.
                        </Text>

                        <Text style={subheading}>Thông tin cuộc hẹn của bạn:</Text>

                        <Section style={infoCard}>
                            <Row style={infoRow}>
                                <Column style={infoLabel}>Chiến dịch:</Column>
                                <Column style={infoValue}>{campaignName}</Column>
                            </Row>
                            <Row style={infoRow}>
                                <Column style={infoLabel}>Cơ sở y tế:</Column>
                                <Column style={infoValue}>{hospitalName}</Column>
                            </Row>
                            <Row style={infoRow}>
                                <Column style={infoLabel}>Địa điểm:</Column>
                                <Column style={infoValue}>{locationName}</Column>
                            </Row>
                            <Row style={infoRow}>
                                <Column style={infoLabel}>Thời gian:</Column>
                                <Column style={infoValue}>{new Date(startTime).toLocaleString('vi-VN')}</Column>
                            </Row>
                            {appointmentId && (
                                <Row style={infoRow}>
                                    <Column style={infoLabel}>Mã số:</Column>
                                    <Column style={infoValue}>#{appointmentId.slice(0, 8).toUpperCase()}</Column>
                                </Row>
                            )}
                        </Section>
                        {message && (
                            <Section style={messageBox}>
                                <Text style={messageHeading}>Lời nhắn từ bệnh viện:</Text>
                                <Text style={messageContent}>{message}</Text>
                            </Section>
                        )}

                        <Text style={paragraph}>
                            <strong>Lưu ý quan trọng trước khi hiến máu:</strong>
                        </Text>
                        <ul style={list}>
                            <li>Ngủ đủ giấc (ít nhất 6 tiếng) vào đêm trước khi hiến máu.</li>
                            <li>Ăn nhẹ, tránh các đồ ăn nhiều dầu mỡ, rượu bia.</li>
                            <li>Uống nhiều nước (khoảng 500ml) trước khi hiến.</li>
                            <li>Mang theo Căn cước công dân hoặc giấy tờ tùy thân có ảnh.</li>
                        </ul>

                        <Section style={btnSection}>
                            <Link
                                href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/requests`}
                                style={button}
                            >
                                Xem chi tiết đăng ký
                            </Link>
                        </Section>
                    </Section>

                    <Hr style={hr} />

                    <Section style={footer}>
                        <Text style={footerText}>
                            © 2026 RedHope - Kết nối những trái tim nhân ái.
                        </Text>
                        <Text style={footerText}>
                            <Link href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings/notifications`} style={unsubscribeLink}>
                                Hủy đăng ký nhận email
                            </Link>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default RegistrationSuccessEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
};

const header = {
    padding: '32px',
    textAlign: 'center' as const,
    backgroundColor: '#10b981', // Green for success
    borderRadius: '12px 12px 0 0',
    marginTop: '-20px',
};

const h1 = {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
};

const content = {
    padding: '32px',
};

const subheading = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: '24px',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#4b5563',
};

const list = {
    color: '#4b5563',
    fontSize: '15px',
    lineHeight: '24px',
};

const infoCard = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '20px',
    margin: '16px 0',
    border: '1px solid #e5e7eb',
};

const infoRow = {
    paddingBottom: '8px',
};

const infoLabel = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#6b7280',
    width: '100px',
};

const infoValue = {
    fontSize: '14px',
    color: '#111827',
    fontWeight: '600',
};

const btnSection = {
    textAlign: 'center' as const,
    marginTop: '32px',
};

const button = {
    backgroundColor: '#6324eb',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 24px',
};

const hr = {
    borderColor: '#e2e8f0',
    margin: '20px 0',
};

const footer = {
    padding: '0 32px',
};

const footerText = {
    fontSize: '12px',
    color: '#94a3b8',
    textAlign: 'center' as const,
};

const messageBox = {
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    padding: '16px',
    margin: '24px 0',
    borderLeft: '4px solid #3b82f6',
};

const messageHeading = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#1d4ed8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '0 0 8px 0',
};

const messageContent = {
    fontSize: '14px',
    lineHeight: '22px',
    color: '#1e3a8a',
    margin: '0',
    fontStyle: 'italic',
};

const unsubscribeLink = {
    color: '#94a3b8',
    fontSize: '12px',
    textDecoration: 'underline',
};
