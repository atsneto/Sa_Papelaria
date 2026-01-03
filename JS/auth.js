// Utilitário de autenticação
const Auth = {
    // Verificar se usuário está logado
    async verificarLogin() {
        try {
            const { data: { session } } = await clienteSupabase.auth.getSession();
            return session ? session.user : null;
        } catch (error) {
            console.error('Erro ao verificar login:', error);
            return null;
        }
    },

    // Obter usuário atual
    async getUsuario() {
        try {
            const { data: { user } } = await clienteSupabase.auth.getUser();
            return user;
        } catch (error) {
            console.error('Erro ao obter usuário:', error);
            return null;
        }
    },

    // Fazer logout
    async logout() {
        try {
            const { error } = await clienteSupabase.auth.signOut();
            if (error) throw error;
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    },

    // Redirecionar para login se não estiver autenticado
    async requireAuth(redirectUrl = null) {
        const user = await this.verificarLogin();
        if (!user) {
            const currentUrl = redirectUrl || window.location.pathname + window.location.search;
            window.location.href = `login.html?redirect=${encodeURIComponent(currentUrl)}`;
            return false;
        }
        return true;
    },

    // Atualizar UI baseado no estado de autenticação
    async atualizarUI() {
        const user = await this.verificarLogin();
        const navMenu = document.querySelector('.nav');
        
        if (!navMenu) return;

        // Remover botão de login/conta existente se houver
        const existingAuthBtn = navMenu.querySelector('.auth-btn-nav');
        if (existingAuthBtn) existingAuthBtn.remove();

        if (user) {
            // Usuário logado - mostrar nome e opção de sair
            const userName = user.user_metadata?.nome || user.email.split('@')[0];
            const authHTML = `
                <div class="auth-btn-nav" style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: var(--rosa-escuro); font-weight: 600;">Olá, ${userName}</span>
                    <button onclick="Auth.logout()" style="background: var(--rosa-suave); color: var(--rosa-escuro); border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                        Sair
                    </button>
                </div>
            `;
            navMenu.insertAdjacentHTML('beforeend', authHTML);
        } else {
            // Usuário não logado - mostrar botão de login
            const authHTML = `
                <a href="login.html" class="auth-btn-nav" style="background: var(--rosa-escuro); color: var(--branco); padding: 8px 16px; border-radius: 10px; font-weight: 600; transition: all 0.2s;">
                    Entrar
                </a>
            `;
            navMenu.insertAdjacentHTML('beforeend', authHTML);
        }
    }
};

// Atualizar UI quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    Auth.atualizarUI();
});

// Listener para mudanças no estado de autenticação
if (clienteSupabase) {
    clienteSupabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        Auth.atualizarUI();
    });
}
