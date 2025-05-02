// Configurações Globais
const config = {
    apiUrl: 'https://api.example.com',
    themeColors: {
        primary: '#3498db',
        success: '#27ae60',
        warning: '#f39c12'
    }
};

// Utilitários
const utils = {
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    },
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Dashboard
const dashboard = {
    updateCard(selector, value, description = '') {
        const card = document.querySelector(selector);
        if (card) {
            card.querySelector('.card-value').textContent = utils.formatCurrency(value);
            card.querySelector('.card-description').textContent = description;
        }
    },
    async fetchData() {
        try {
            const response = await fetch(`${config.apiUrl}/dashboard`);
            const data = await response.json();
            this.updateCard('#card1', data.total, 'Comparado ao mês anterior');
            this.updateCard('#card2', data.reports, 'Relatórios pendentes');
        } catch (error) {
            utils.showToast('Erro ao carregar dados', 'danger');
        }
    },
    initialize() {
        this.fetchData();
    }
};

// Navegação
const navigation = {
    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    dashboard.initialize();
    navigation.initNavigation();
    utils.showToast('Bem-vindo ao sistema!', 'success');
});