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

interface AppointmentReminderEmailProps {
    donorName: string;
    campaignName: string;
    hospitalName: string;
    locationName: string;
    startTime: string;
    hoursLeft: 4 | 8;
    message?: string;
}

export const AppointmentReminderEmail = ({
    donorName,
    campaignName,
    hospitalName,
    locationName,
    startTime,
    hoursLeft,
    message,
}: AppointmentReminderEmailProps) => {
    const previewText = `Nhắc nhở: Chỉ còn ${hoursLeft} giờ nữa đến lịch hiến máu của bạn`;
    const accentColor = hoursLeft === 4 ? '#ef4444' : '#f59e0b'; // Red for 4h, Orange for 8h

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={{ ...header, backgroundColor: accentColor }}>
                        <Heading style={h1}>Nhắc Nhở Lịch Hiến Máu</Heading>
                    </Section>

                    <Section style={content}>
                        <Text style={paragraph}>Chào <strong>{donorName}</strong>,</Text>
                        <Text style={paragraph}>
                            Đây là tin nhắn nhắc nhở chỉ còn khoảng <strong>{hoursLeft} giờ</strong> nữa là đến lịch hẹn hiến máu của bạn tại
                            chiến dịch <strong>{campaignName}</strong>.
                        </Text>

                        <Section style={infoCard}>
                            <Row style={infoRow}>
                                <Column style={infoLabel}>Chiến dịch:</Column>
                                <Column style={infoValue}>{campaignName}</Column>
                            </Row>
                            <Row style={infoRow}>
                                <Column style={infoLabel}>Địa điểm:</Column>
                                <Column style={infoValue}>{locationName}</Column>
                            </Row>
                            <Row style={infoRow}>
                                <Column style={infoLabel}>Thời gian:</Column>
                                <Column style={infoValue}>{new Date(startTime).toLocaleString('vi-VN')}</Column>
                            </Row>
                            <Row style={infoRow}>
                                <Column style={infoLabel}>Bệnh viện:</Column>
                                <Column style={infoValue}>{hospitalName}</Column>
                            </Row>
                        </Section>

                        {message && (
                            <Section style={messageBox}>
                                <Text style={messageHeading}>Lời nhắn từ bệnh viện:</Text>
                                <Text style={messageContent}>{message}</Text>
                            </Section>
                        )}

                        <Text style={paragraph}>
                            {hoursLeft === 8 ? (
                                "Lời khuyên: Bạn nên nghỉ ngơi sớm, tránh thức khuya và không uống rượu bia tối nay để ngày mai có sức khỏe tốt nhất."
                            ) : (
                                "Lời khuyên: Hãy uống một cốc nước ấm ngay bây giờ và ăn nhẹ nếu bạn chưa ăn gì. Hẹn gặp bạn tại điểm hiến máu!"
                            )}
                        </Text>

                        <Section style={btnSection}>
                            <Link
                                href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/requests`}
                                style={{ ...button, backgroundColor: accentColor }}
                            >
                                Xem đường đi & Chi tiết
                            </Link>
                        </Section>
                    </Section>

                    <Hr style={hr} />

                    <Section style={footer}>
                        <Text style={footerText}>
                            © 2026 RedHope - Cùng nhau cứu người.
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

export default AppointmentReminderEmail;

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
    borderRadius: '12px 12px 0 0',
    marginTop: '-20px',
};

const h1 = {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 'bold',
    margin: '0',
    textTransform: 'uppercase' as const,
};

const content = {
    padding: '32px',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#4b5563',
};

const infoCard = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0',
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
    backgroundColor: '#fffbeb',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
    borderLeft: '4px solid #f59e0b',
};

const messageHeading = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#b45309',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '0 0 8px 0',
};

const messageContent = {
    fontSize: '14px',
    lineHeight: '22px',
    color: '#92400e',
    margin: '0',
    fontStyle: 'italic',
};

const unsubscribeLink = {
    color: '#94a3b8',
    fontSize: '12px',
    textDecoration: 'underline',
};
