import { LinkingOptions } from '@react-navigation/native';

const config = {
    screens: {
        ResetPassword: 'reset-password',
        // Auth Navigator Flow
        Auth: {
            screens: {
                // ResetPassword moved to Root
            },
        },
        // Main Navigator (após autenticação)
        Main: {
            screens: {
                // Tab: Descobrir
                Discover: {
                    screens: {
                        Invite: {
                            path: 'invite/:inviteCode',
                            parse: {
                                inviteCode: (inviteCode: string) => inviteCode.toUpperCase(),
                            },
                        },
                        EventDetails: 'event/:eventId',
                    },
                },
            },
        },
    },
};

export const linking: LinkingOptions<any> = {
    prefixes: ['resenha://', 'https://resenhaapp.com'],
    config,
};
