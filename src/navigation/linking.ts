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
    },
};

export const linking: LinkingOptions<any> = {
    prefixes: ['resenha://'],
    config,
};
