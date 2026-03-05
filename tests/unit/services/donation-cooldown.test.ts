/**
 * Test: Donation Cooldown (3 tháng / 84 ngày)
 * Kiểm tra logic chặn đăng ký chiến dịch khi chưa đủ 3 tháng sau lần hiến máu gần nhất.
 * 
 * Bao gồm:
 * 1. screeningService.checkDonationCooldown()
 * 2. screeningService.checkEligibility() tích hợp cooldown
 * 3. campaignService.registerToCampaign() cooldown guard
 * 4. campaignService.registerToBloodRequest() cooldown guard
 */

/* ═══════════════════════════════════════════════════
   ═══ Part 1: screeningService - Cooldown Logic ═══
   ═══════════════════════════════════════════════════ */

// Mock supabase
const mockMaybeSingle = jest.fn();
const mockLimit = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockOrder = jest.fn(() => ({ limit: mockLimit }));
const mockEq = jest.fn(() => ({ order: mockOrder }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom: jest.Mock = jest.fn((_table: string) => ({ select: mockSelect }));

// Mock supabase.auth for screening status
const mockGetUser = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: (...args: any[]) => mockFrom(...args),
        auth: {
            getUser: () => mockGetUser(),
            updateUser: (...args: any[]) => mockUpdateUser(...args),
        },
    },
}));

import { screeningService } from '@/services/screening.service';

describe('screeningService.checkDonationCooldown', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return onCooldown=false when user has no donation records', async () => {
        mockMaybeSingle.mockResolvedValue({ data: null, error: null });

        const result = await screeningService.checkDonationCooldown('user-1');

        expect(result.onCooldown).toBe(false);
        expect(result.nextEligibleDate).toBeNull();
        expect(result.daysSinceLast).toBeNull();
        expect(result.daysRemaining).toBeNull();
        expect(mockFrom).toHaveBeenCalledWith('donation_records');
    });

    it('should return onCooldown=true when last donation was 30 days ago', async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        mockMaybeSingle.mockResolvedValue({
            data: { verified_at: thirtyDaysAgo.toISOString() },
            error: null,
        });

        const result = await screeningService.checkDonationCooldown('user-1');

        expect(result.onCooldown).toBe(true);
        expect(result.daysSinceLast).toBe(30);
        expect(result.daysRemaining).toBe(54); // 84 - 30
        expect(result.nextEligibleDate).toBeInstanceOf(Date);
    });

    it('should return onCooldown=true when last donation was 1 day ago', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        mockMaybeSingle.mockResolvedValue({
            data: { verified_at: yesterday.toISOString() },
            error: null,
        });

        const result = await screeningService.checkDonationCooldown('user-1');

        expect(result.onCooldown).toBe(true);
        expect(result.daysSinceLast).toBe(1);
        expect(result.daysRemaining).toBe(83);
    });

    it('should return onCooldown=true when last donation was 83 days ago (edge case)', async () => {
        const eightyThreeDaysAgo = new Date();
        eightyThreeDaysAgo.setDate(eightyThreeDaysAgo.getDate() - 83);

        mockMaybeSingle.mockResolvedValue({
            data: { verified_at: eightyThreeDaysAgo.toISOString() },
            error: null,
        });

        const result = await screeningService.checkDonationCooldown('user-1');

        expect(result.onCooldown).toBe(true);
        expect(result.daysSinceLast).toBe(83);
        expect(result.daysRemaining).toBe(1);
    });

    it('should return onCooldown=false when last donation was exactly 84 days ago', async () => {
        const eightyFourDaysAgo = new Date();
        eightyFourDaysAgo.setDate(eightyFourDaysAgo.getDate() - 84);

        mockMaybeSingle.mockResolvedValue({
            data: { verified_at: eightyFourDaysAgo.toISOString() },
            error: null,
        });

        const result = await screeningService.checkDonationCooldown('user-1');

        expect(result.onCooldown).toBe(false);
        expect(result.daysSinceLast).toBe(84);
        expect(result.daysRemaining).toBeNull();
    });

    it('should return onCooldown=false when last donation was 100 days ago', async () => {
        const hundredDaysAgo = new Date();
        hundredDaysAgo.setDate(hundredDaysAgo.getDate() - 100);

        mockMaybeSingle.mockResolvedValue({
            data: { verified_at: hundredDaysAgo.toISOString() },
            error: null,
        });

        const result = await screeningService.checkDonationCooldown('user-1');

        expect(result.onCooldown).toBe(false);
        expect(result.daysSinceLast).toBe(100);
    });

    it('should return onCooldown=false when DB query errors (fail-open)', async () => {
        mockMaybeSingle.mockResolvedValue({
            data: null,
            error: { message: 'DB error' },
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = await screeningService.checkDonationCooldown('user-1');

        expect(result.onCooldown).toBe(false);
        consoleSpy.mockRestore();
    });

    it('should calculate nextEligibleDate correctly', async () => {
        const fiftyDaysAgo = new Date();
        fiftyDaysAgo.setDate(fiftyDaysAgo.getDate() - 50);

        mockMaybeSingle.mockResolvedValue({
            data: { verified_at: fiftyDaysAgo.toISOString() },
            error: null,
        });

        const result = await screeningService.checkDonationCooldown('user-1');

        expect(result.onCooldown).toBe(true);
        expect(result.daysRemaining).toBe(34);

        // Next eligible date should be 84 days after donation
        const expectedDate = new Date(fiftyDaysAgo);
        expectedDate.setDate(expectedDate.getDate() + 84);
        expect(result.nextEligibleDate!.toDateString()).toBe(expectedDate.toDateString());
    });
});

/* ════════════════════════════════════════════════════════
   ═══ Part 2: checkEligibility - Cooldown Integration ═══
   ════════════════════════════════════════════════════════ */

describe('screeningService.checkEligibility (with cooldown)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return cooldown status when user donated recently', async () => {
        // Mock donation_records - 10 days ago
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        mockMaybeSingle.mockResolvedValue({
            data: { verified_at: tenDaysAgo.toISOString() },
            error: null,
        });

        const result = await screeningService.checkEligibility('user-1');

        expect(result.eligible).toBe(false);
        expect(result.status).toBe('cooldown');
        expect(result.reason).toContain('3 tháng');
        expect(result.reason).toContain('84 ngày');
    });

    it('should check AI screening when cooldown is cleared (no donations)', async () => {
        // No donation records
        mockMaybeSingle.mockResolvedValue({ data: null, error: null });

        // Mock auth for screening status - passed
        mockGetUser.mockResolvedValue({
            data: {
                user: {
                    id: 'user-1',
                    user_metadata: {
                        screening_status: 'passed',
                        screening_verified_at: new Date().toISOString(),
                    },
                },
            },
            error: null,
        });

        const result = await screeningService.checkEligibility('user-1');

        expect(result.eligible).toBe(true);
        expect(result.status).toBe('passed');
    });

    it('should check AI screening when cooldown is cleared (donation > 84 days ago)', async () => {
        // Donation 90 days ago
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        mockMaybeSingle.mockResolvedValue({
            data: { verified_at: ninetyDaysAgo.toISOString() },
            error: null,
        });

        // Mock auth - passed screening
        mockGetUser.mockResolvedValue({
            data: {
                user: {
                    id: 'user-1',
                    user_metadata: {
                        screening_status: 'passed',
                        screening_verified_at: new Date().toISOString(),
                    },
                },
            },
            error: null,
        });

        const result = await screeningService.checkEligibility('user-1');

        expect(result.eligible).toBe(true);
        expect(result.status).toBe('passed');
    });

    it('should prioritize cooldown over screening status', async () => {
        // Donated 5 days ago (on cooldown)
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        mockMaybeSingle.mockResolvedValue({
            data: { verified_at: fiveDaysAgo.toISOString() },
            error: null,
        });

        // Even if screening passed, cooldown should take priority
        // (getUser won't even be called because cooldown check returns first)

        const result = await screeningService.checkEligibility('user-1');

        expect(result.eligible).toBe(false);
        expect(result.status).toBe('cooldown');
    });

    it('should return not_done when no donation history and no screening', async () => {
        // No donations
        mockMaybeSingle.mockResolvedValue({ data: null, error: null });

        // Mock auth - not done
        mockGetUser.mockResolvedValue({
            data: {
                user: {
                    id: 'user-1',
                    user_metadata: {},
                },
            },
            error: null,
        });

        const result = await screeningService.checkEligibility('user-1');

        expect(result.eligible).toBe(false);
        expect(result.status).toBe('not_done');
    });
});

/* ══════════════════════════════════════════════════════════
   ═══ Part 3: campaignService - Registration Cooldown ═══
   ══════════════════════════════════════════════════════════ */

// We need to test campaign.service separately because it has its own mock setup
// These tests verify the cooldown guard in registerToCampaign and registerToBloodRequest

describe('campaignService cooldown guard', () => {
    // Note: campaignService is already using the mocked supabase from above
    // We'll dynamically require it after mock setup

    let campaignServiceModule: any;

    beforeAll(() => {
        // Mock notification service
        jest.mock('@/services/notification.service', () => ({
            notificationService: {
                sendCampaignNotification: jest.fn(),
                createNotification: jest.fn(),
            },
        }));

        campaignServiceModule = require('@/services/campaign.service').campaignService;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('registerToCampaign should throw when user is on cooldown', async () => {
        const twentyDaysAgo = new Date();
        twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

        // Mock from('donation_records') to return recent donation
        mockFrom.mockImplementation((table: string) => {
            if (table === 'donation_records') {
                return {
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            order: jest.fn(() => ({
                                limit: jest.fn(() => ({
                                    maybeSingle: jest.fn().mockResolvedValue({
                                        data: { verified_at: twentyDaysAgo.toISOString() },
                                        error: null,
                                    }),
                                })),
                            })),
                        })),
                    })),
                };
            }
            // Default for other tables
            return {
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                        })),
                        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                    })),
                })),
                insert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: {}, error: null }),
                    })),
                })),
            };
        });

        await expect(
            campaignServiceModule.registerToCampaign('user-1', 'campaign-1')
        ).rejects.toThrow('3 tháng');
    });

    it('registerToBloodRequest should throw when user is on cooldown', async () => {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        mockFrom.mockImplementation((table: string) => {
            if (table === 'donation_records') {
                return {
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            order: jest.fn(() => ({
                                limit: jest.fn(() => ({
                                    maybeSingle: jest.fn().mockResolvedValue({
                                        data: { verified_at: tenDaysAgo.toISOString() },
                                        error: null,
                                    }),
                                })),
                            })),
                        })),
                    })),
                };
            }
            return {
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                        })),
                        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                    })),
                })),
                insert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: {}, error: null }),
                    })),
                })),
            };
        });

        await expect(
            campaignServiceModule.registerToBloodRequest('user-1', 'request-1')
        ).rejects.toThrow('3 tháng');
    });

    it('registerToCampaign should proceed when cooldown is cleared', async () => {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        mockFrom.mockImplementation((table: string) => {
            if (table === 'donation_records') {
                return {
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            order: jest.fn(() => ({
                                limit: jest.fn(() => ({
                                    maybeSingle: jest.fn().mockResolvedValue({
                                        data: { verified_at: ninetyDaysAgo.toISOString() },
                                        error: null,
                                    }),
                                })),
                            })),
                        })),
                    })),
                };
            }
            if (table === 'appointments') {
                return {
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            eq: jest.fn(() => ({
                                maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                            })),
                        })),
                    })),
                    insert: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({
                                data: { id: 'appt-new', status: 'Booked' },
                                error: null,
                            }),
                        })),
                    })),
                };
            }
            if (table === 'campaigns') {
                return {
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({
                                data: { hospital_id: 'hospital-1', name: 'Test Campaign' },
                                error: null,
                            }),
                        })),
                    })),
                };
            }
            if (table === 'users') {
                return {
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({
                                data: { full_name: 'Test User' },
                                error: null,
                            }),
                        })),
                    })),
                };
            }
            return {
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: null, error: null }),
                    })),
                })),
            };
        });

        // Should NOT throw
        const result = await campaignServiceModule.registerToCampaign('user-1', 'campaign-1');
        expect(result).toBeDefined();
    });

    it('registerToCampaign should proceed when no donation records exist', async () => {
        mockFrom.mockImplementation((table: string) => {
            if (table === 'donation_records') {
                return {
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            order: jest.fn(() => ({
                                limit: jest.fn(() => ({
                                    maybeSingle: jest.fn().mockResolvedValue({
                                        data: null,
                                        error: null,
                                    }),
                                })),
                            })),
                        })),
                    })),
                };
            }
            if (table === 'appointments') {
                return {
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            eq: jest.fn(() => ({
                                maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                            })),
                        })),
                    })),
                    insert: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({
                                data: { id: 'appt-first', status: 'Booked' },
                                error: null,
                            }),
                        })),
                    })),
                };
            }
            if (table === 'campaigns') {
                return {
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({
                                data: { hospital_id: 'hospital-1', name: 'Test' },
                                error: null,
                            }),
                        })),
                    })),
                };
            }
            if (table === 'users') {
                return {
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({
                                data: { full_name: 'New Donor' },
                                error: null,
                            }),
                        })),
                    })),
                };
            }
            return {
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: null, error: null }),
                    })),
                })),
            };
        });

        const result = await campaignServiceModule.registerToCampaign('user-new', 'campaign-1');
        expect(result).toBeDefined();
    });
});

export { };
