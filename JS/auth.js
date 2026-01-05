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

    // Verificar se usuário é admin
    async isAdmin() {
        const user = await this.verificarLogin();
        if (!user) return false;
        
        // Buscar role da tabela perfis
        try {
            const { data, error } = await clienteSupabase
                .from('perfis')
                .select('role')
                .eq('id', user.id)
                .single();
            
            if (error) {
                console.error('Erro ao verificar role:', error);
                return false;
            }
            
            return data?.role === 'admin';
        } catch (error) {
            console.error('Erro ao verificar admin:', error);
            return false;
        }
    },

    // Proteger página admin (apenas administradores)
    async requireAdmin() {
        const user = await this.verificarLogin();
        if (!user) {
            alert('Você precisa fazer login para acessar esta página.');
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        
        const isAdmin = await this.isAdmin();
        if (!isAdmin) {
            alert('Acesso negado! Apenas administradores podem acessar esta página.');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    // Atualizar UI baseado no estado de autenticação
    async atualizarUI() {
        // Prevenir execuções simultâneas
        if (this._atualizandoUI) return;
        this._atualizandoUI = true;
        
        try {
            const user = await this.verificarLogin();
            const navMenu = document.querySelector('.nav');
            
            if (!navMenu) return;

            // Remover TODOS os botões de login/conta existentes
            const existingAuthBtns = navMenu.querySelectorAll('.user-dropdown');
            existingAuthBtns.forEach(btn => btn.remove());

        if (user) {
            // Buscar nome e role do perfil
            let userName = user.email.split('@')[0];
            let userRole = 'cliente';
            
            try {
                const { data } = await clienteSupabase
                    .from('perfis')
                    .select('nome, role')
                    .eq('id', user.id)
                    .single();
                
                if (data?.nome) userName = data.nome;
                if (data?.role) userRole = data.role;
            } catch (error) {
                console.error('Erro ao buscar perfil:', error);
            }
            
            // Verificar se é admin
            const isAdmin = userRole === 'admin';
            
            console.log('User role:', userRole, 'isAdmin:', isAdmin);
            
            // Criar menu com botão admin se for admin
            let menuItems = '';
            
            if (isAdmin) {
    menuItems += `
        <button onclick="window.location.href='admin.html'" class="user-menu-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"
                    stroke="currentColor" stroke-width="2"/>
                <path d="M7 11V7C7 5.67 7.53 4.4 8.46 3.46
                    9.4 2.53 10.67 2 12 2
                    13.33 2 14.6 2.53 15.54 3.46
                    16.47 4.4 17 5.67 17 7V11"
                    stroke="currentColor" stroke-width="2"/>
            </svg>
            Admin
        </button>
    `;
}
            
            menuItems += `
    <button onclick="Auth.logout()" class="user-menu-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5C4.47 21 3.96 20.79 3.59 20.41
                3.21 20.04 3 19.53 3 19V5
                C3 4.47 3.21 3.96 3.59 3.59
                3.96 3.21 4.47 3 5 3H9"
                stroke="currentColor" stroke-width="2"/>
            <path d="M16 17L21 12L16 7"
                stroke="currentColor" stroke-width="2"/>
            <path d="M21 12H9"
                stroke="currentColor" stroke-width="2"/>
        </svg>
        Sair
    </button>
`;
            
            // Usuário logado - mostrar dropdown com nome e menu
            const authHTML = `
                <div class="user-dropdown">
                    <div class="user-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>Olá, ${userName}</span>
                        <svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="user-menu">
                        ${menuItems}
                    </div>
                </div>
            `;
            navMenu.insertAdjacentHTML('beforeend', authHTML);
        } else {
            // Usuário não logado - mostrar dropdown com login e cadastro
            const authHTML = `
                <div class="user-dropdown">
                    <div class="user-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>Login<span class="cadastro-text"> / Cadastro</span></span>
                        <svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="user-menu">
                        <a href="login.html" class="user-menu-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Login
                        </a>
                        <a href="cadastro.html" class="user-menu-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M20 8V14M17 11H23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Cadastro
                        </a>
                    </div>
                </div>
            `;
            navMenu.insertAdjacentHTML('beforeend', authHTML);
        }
        } finally {
            this._atualizandoUI = false;
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
