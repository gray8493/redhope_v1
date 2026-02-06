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
    Img,
    Row,
    Column,
} from '@react-email/components';
import * as React from 'react';

interface CampaignAnnouncementEmailProps {
    donorName: string;
    campaignName: string;
    hospitalName: string;
    startTime: string;
    endTime: string;
    locationName: string;
    message?: string;
}

export const CampaignAnnouncementEmail = ({
    donorName,
    campaignName,
    hospitalName,
    startTime,
    endTime,
    locationName,
    message,
}: CampaignAnnouncementEmailProps) => {
    const previewText = `Thông tin quan trọng về chiến dịch hiến máu: ${campaignName}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Heading style={h1}>Thông Tin Chiến Dịch</Heading>
                    </Section>

                    <Section style={content}>
                        <Text style={paragraph}>Chào <strong>{donorName}</strong>,</Text>
                        <Text style={paragraph}>
                            Cảm ơn bạn đã đăng ký tham gia chiến dịch <strong>{campaignName}</strong> tại <strong>{hospitalName}</strong>.
                            Chúng tôi xin gửi đến bạn thông tin chi tiết để bạn có sự chuẩn bị tốt nhất.
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
                                <Column style={infoLabel}>Bắt đầu:</Column>
                                <Column style={infoValue}>{new Date(startTime).toLocaleString('vi-VN')}</Column>
                            </Row>
                            <Row style={infoRow}>
                                <Column style={infoLabel}>Kết thúc:</Column>
                                <Column style={infoValue}>{new Date(endTime).toLocaleString('vi-VN')}</Column>
                            </Row>
                        </Section>

                        {message && (
                            <Section style={messageBox}>
                                <Text style={messageLabel}>Lưu ý từ Bệnh viện:</Text>
                                <Text style={messageText}>{message}</Text>
                            </Section>
                        )}

                        <Text style={paragraph}>
                            Vui lòng có mặt đúng giờ và mang theo giấy tờ tùy thân. Nếu bạn có bất kỳ thay đổi nào về lịch trình, vui lòng thông báo sớm cho chúng tôi qua ứng dụng RedHope.
                        </Text>

                        <Section style={btnSection}>
                            <Link
                                href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/requests`}
                                style={button}
                            >
                                Đến ngay
                            </Link>
                        </Section>
                    </Section>

                    <Hr style={hr} />

                    <Section style={footer}>
                        <Text style={footerText}>
                            © 2026 RedHope - Nền tảng kết nối hiến máu nhân đạo.
                        </Text>
                        <Text style={footerText}>
                            Bạn nhận được email này vì đã đăng ký tham gia chiến dịch trên hệ thống của chúng tôi.
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

export default CampaignAnnouncementEmail;

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
    backgroundColor: '#6324eb',
    borderRadius: '12px 12px 0 0',
    marginTop: '-20px',
};

const h1 = {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
    letterSpacing: '-0.5px',
};

const content = {
    padding: '32px',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#484848',
};

const infoCard = {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0',
    border: '1px solid #e2e8f0',
};

const infoRow = {
    paddingBottom: '8px',
};

const infoLabel = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#64748b',
    width: '100px',
};

const infoValue = {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: '600',
};

const messageBox = {
    borderLeft: '4px solid #6324eb',
    backgroundColor: '#f0eaff',
    padding: '16px',
    margin: '24px 0',
};

const messageLabel = {
    fontSize: '12px',
    fontWeight: '800',
    color: '#6324eb',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '4px',
    marginTop: '0',
};

const messageText = {
    fontSize: '14px',
    lineHeight: '22px',
    color: '#312e81',
    margin: '0',
    fontStyle: 'italic',
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
    lineHeight: '20px',
    color: '#94a3b8',
    textAlign: 'center' as const,
    margin: '4px 0',
};

const unsubscribeLink = {
    color: '#94a3b8',
    fontSize: '12px',
    textDecoration: 'underline',
};
