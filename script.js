class NumConvert {
    constructor() {
        this.inputs = {
            hex: document.getElementById('hexInput'),
            dec: document.getElementById('decInput'),
            oct: document.getElementById('octInput'),
            bin: document.getElementById('binInput')
        };
        
        this.bases = {
            hex: 16, dec: 10, oct: 8, bin: 2
        };
        
        this.validChars = {
            hex: /^[0-9a-fA-F]*$/,
            dec: /^[0-9]*$/,
            oct: /^[0-7]*$/,
            bin: /^[01]*$/
        };
        
        this.currentValue = 0;
        this.activeInput = null;
        
        this.init();
    }
    
    init() {
        Object.keys(this.inputs).forEach(key => {
            const input = this.inputs[key];
            
            input.addEventListener('input', (e) => this.handleInput(key, e.target.value));
            input.addEventListener('focus', () => {
                this.activeInput = key;
                input.classList.remove('error');
            });
            input.addEventListener('blur', () => { this.activeInput = null; });
            input.addEventListener('keypress', (e) => this.validateKeypress(key, e));
        });
        
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => this.copyToClipboard(btn));
        });
        
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        this.loadTheme();
        this.updateAll('dec', '0');
    }
    
    handleInput(source, value) {
        value = value.replace(/^0+(?=.)/, '');
        if (value === '') value = '0';
        
        if (!this.validChars[source].test(value)) {
            this.inputs[source].classList.add('error');
            return;
        }
        
        this.inputs[source].classList.remove('error');
        
        try {
            const decimal = parseInt(value, this.bases[source]);
            
            if (isNaN(decimal)) {
                this.inputs[source].classList.add('error');
                return;
            }
            
            if (decimal > Number.MAX_SAFE_INTEGER) {
                this.showToast('Number too large for safe conversion');
                this.inputs[source].classList.add('error');
                return;
            }
            
            this.currentValue = decimal;
            this.updateAllFromDecimal(source, decimal);
            
        } catch (err) {
            this.inputs[source].classList.add('error');
        }
    }
    
    updateAllFromDecimal(source, decimal) {
        Object.keys(this.inputs).forEach(key => {
            if (key !== source) {
                const converted = decimal.toString(this.bases[key]).toUpperCase();
                this.inputs[key].value = converted;
            }
        });
    }
    
    updateAll(source, value) {
        this.inputs[source].value = value;
        this.handleInput(source, value);
    }
    
    validateKeypress(source, e) {
        const char = String.fromCharCode(e.which || e.keyCode);
        if (e.ctrlKey || e.metaKey || e.altKey) return true;
        if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab') return true;
        
        if (!this.validChars[source].test(char)) {
            e.preventDefault();
            return false;
        }
        return true;
    }
    
    async copyToClipboard(btn) {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        const value = input.value || '0';
        
        try {
            await navigator.clipboard.writeText(value);
            btn.classList.add('copied');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
            
            this.showToast(`Copied: ${value}`);
            
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = originalHTML;
            }, 1500);
            
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = value;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Copied to clipboard');
        }
    }
    
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 2000);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('numconvert-theme', newTheme);
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('numconvert-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => { new NumConvert(); });
