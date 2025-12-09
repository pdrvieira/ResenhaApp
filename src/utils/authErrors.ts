export const translateSupabaseError = (error: string): string => {
    const message = error.toLowerCase();

    // Erros comuns de login
    if (message.includes('invalid login credentials')) {
        return 'E-mail ou senha incorretos.';
    }
    if (message.includes('user not found') || message.includes('invalid email or password')) {
        return 'E-mail ou senha incorretos.';
    }
    if (message.includes('email not confirmed')) {
        return 'Por favor, confirme seu e-mail antes de entrar.';
    }

    // Erros de cadastro
    if (message.includes('user already registered') || message.includes('already registered')) {
        return 'Este e-mail já está em uso.';
    }
    if (message.includes('password should be at least')) {
        return 'A senha deve ter pelo menos 6 caracteres.';
    }

    // Erros de validação
    if (message.includes('invalid email')) {
        return 'Endereço de e-mail inválido.';
    }

    // Fallback
    return 'Ocorreu um erro. Tente novamente.';
};
