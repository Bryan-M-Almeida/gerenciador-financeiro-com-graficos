// ============================
// CONFIGURAÇÃO E DADOS INICIAIS
// ============================

// Chave do localStorage pra salvar e recuperar os dados
const STORAGE_KEY = "financasApp";

// Estrutura de dados principal do app
let dados = {
    renda: 0,
    gastos: [],
    metas: [],
    extras: []
};

let editandoExtraIndex = null; // controle para edição (não usado no código atual)

// ============================
// FORMULÁRIOS REGISTRADOS
// ============================

// Map dos formulários e seus inputs para fácil manipulação
const forms = [
    { id: 'rendaForm', inputs: ['.rendaInput'] },
    { id: 'metaForm', inputs: ['.metaInput'] },
    { id: 'gastoForm', inputs: ['.valorGastosInput', '.descricaoGastosInput'] },
    { id: 'extraForm', inputs: ['.valorExtraInput', '.descricaoExtraInput'] }
];

// ============================
// LOAD INICIAL
// ============================

// Quando a página carrega, busca os dados salvos e atualiza a interface
window.onload = () => {
    carregarDados();
};

// ============================
// FUNÇÕES PRINCIPAIS
// ============================

// Carrega os dados do localStorage e atualiza a tela e gráfico
function carregarDados() {
    const salvos = localStorage.getItem(STORAGE_KEY);
    if (salvos) dados = JSON.parse(salvos);

    atualizarResumo();
    atualizarGrafico();
}

// Salva os dados atuais no localStorage
function salvarDados() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

// ============================
// ENVIO DOS FORMULÁRIOS
// ============================

// Para cada formulário registrado, adiciona listener de submit para tratar os dados
forms.forEach(({ id, inputs }) => {
    const form = document.getElementById(id);
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Renda
        if (id === 'rendaForm') {
            const input = document.querySelector('.rendaInput');
            if (input) {
                dados.renda = parseFloat(input.value) || 0;
                input.value = "";
            }
        }

        // Meta
        if (id === 'metaForm') {
            const input = document.querySelector('.metaInput');
            if (input) {
                const valorMeta = parseFloat(input.value);
                if (!isNaN(valorMeta)) dados.metas.push(valorMeta);
                input.value = "";
            }
        }

        // Gasto
        if (id === 'gastoForm') {
            const valor = parseFloat(document.querySelector('.valorGastosInput').value);
            const descricao = document.querySelector('.descricaoGastosInput').value;
            if (!isNaN(valor) && descricao.trim()) {
                dados.gastos.push({ valor, descricao });
                document.querySelector('.valorGastosInput').value = "";
                document.querySelector('.descricaoGastosInput').value = "";
            }
        }

        // Extra
        if (id === 'extraForm') {
            const valor = parseFloat(document.querySelector('.valorExtraInput').value);
            const descricao = document.querySelector('.descricaoExtraInput').value;
            if (!isNaN(valor) && descricao.trim()) {
                dados.extras.push({ valor, descricao });
                document.querySelector('.valorExtraInput').value = "";
                document.querySelector('.descricaoExtraInput').value = "";
            }
        }

        // Atualiza dados salvos e interface após qualquer envio
        salvarDados();
        atualizarResumo();
        atualizarGrafico();
    });
});

// ============================
// ATUALIZAR ITENS NA TELA
// ============================

// Atualiza as listas de renda, gastos, metas e extras, criando botões de editar e deletar
function atualizarResumo() {
    document.querySelector("#renda h1").innerText = `Renda Mensal: R$ ${dados.renda.toFixed(2)}`;

    const listaGastos = document.getElementById("listaGastos");
    const listaMetas = document.getElementById("listaMetas");
    const listaExtras = document.getElementById("listaExtras");

    listaGastos.innerHTML = "";
    listaMetas.innerHTML = "";
    listaExtras.innerHTML = "";

    // Lista de gastos
    dados.gastos.forEach((gasto, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${gasto.descricao} - R$ ${gasto.valor.toFixed(2)}
            <button onclick="editarGasto(${index})">✏️</button>
            <button onclick="deletarGasto(${index})">🗑️</button>
        `;
        listaGastos.appendChild(li);
    });

    // Lista de metas
    dados.metas.forEach((meta, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            Meta: R$ ${meta.toFixed(2)}
            <button onclick="editarMeta(${index})">✏️</button>
            <button onclick="deletarMeta(${index})">🗑️</button>
        `;
        listaMetas.appendChild(li);
    });

    // Lista de extras
    dados.extras.forEach((extra, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${extra.descricao} - R$ ${extra.valor.toFixed(2)}
            <button onclick="editarExtra(${index})">✏️</button>
            <button onclick="deletarExtra(${index})">🗑️</button>
        `;
        listaExtras.appendChild(li);
    });
}

// ============================
// ATUALIZAR GRÁFICO FINANCEIRO
// ============================

// Atualiza ou cria o gráfico de barras mostrando renda, extras, gastos e metas
function atualizarGrafico() {
    const ctx = document.getElementById("graficoFinanceiro").getContext("2d");

    const totalGastos = dados.gastos.reduce((soma, g) => soma + g.valor, 0);
    const totalMetas = dados.metas.reduce((soma, m) => soma + m, 0);
    const totalExtras = dados.extras.reduce((soma, e) => soma + e.valor, 0);

    const chartData = {
        labels: ['Renda', 'Extras', 'Gastos', 'Metas'],
        datasets: [{
            label: 'Resumo Financeiro',
            data: [dados.renda, totalExtras, totalGastos, totalMetas],
            backgroundColor: ['#4caf50', '#00bcd4', '#e53935', '#ffd700'],
            borderWidth: 1
        }]
    };

    if (window.grafico) {
        window.grafico.data = chartData;
        window.grafico.update();
    } else {
        window.grafico = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

// ============================
// EDIÇÃO DE ITENS
// ============================

// Edita um gasto via prompt, atualiza dados e interface
function editarGasto(index) {
    const novoValor = prompt("Novo valor do gasto:", dados.gastos[index].valor);
    const novaDesc = prompt("Nova descrição:", dados.gastos[index].descricao);

    if (novoValor && novaDesc) {
        dados.gastos[index].valor = parseFloat(novoValor);
        dados.gastos[index].descricao = novaDesc;
        salvarDados();
        atualizarResumo();
        atualizarGrafico();
    }
}

// Edita uma meta via prompt
function editarMeta(index) {
    const novoValor = prompt("Novo valor da meta:", dados.metas[index]);
    if (novoValor) {
        dados.metas[index] = parseFloat(novoValor);
        salvarDados();
        atualizarResumo();
        atualizarGrafico();
    }
}

// Edita um extra via prompt
function editarExtra(index) {
    const novoValor = prompt("Novo valor do extra:", dados.extras[index].valor);
    const novaDesc = prompt("Nova descrição:", dados.extras[index].descricao);

    if (novoValor && novaDesc) {
        dados.extras[index].valor = parseFloat(novoValor);
        dados.extras[index].descricao = novaDesc;
        salvarDados();
        atualizarResumo();
        atualizarGrafico();
    }
}

// ============================
// DELETAR ITENS
// ============================

// Remove um gasto da lista pelo index e atualiza os dados
function deletarGasto(index) {
    if (confirm("Remover esse gasto?")) {
        dados.gastos.splice(index, 1);
        salvarDados();
        atualizarResumo();
        atualizarGrafico();
    }
}

// Remove uma meta da lista pelo index e atualiza os dados
function deletarMeta(index) {
    if (confirm("Remover essa meta?")) {
        dados.metas.splice(index, 1);
        salvarDados();
        atualizarResumo();
        atualizarGrafico();
    }
}

// Remove um extra da lista pelo index e atualiza os dados
function deletarExtra(index) {
    if (confirm("Remover esse extra?")) {
        dados.extras.splice(index, 1);
        salvarDados();
        atualizarResumo();
        atualizarGrafico();
    }
}

// ============================
// RESETAR TODO O LOCALSTORAGE E DADOS
// ============================

// Apaga tudo do localStorage e reseta o app para estado inicial
function resetarTudo() {
    if (confirm("Tem certeza que deseja apagar todos os dados?")) {
        localStorage.removeItem(STORAGE_KEY);
        dados = {
            renda: 0,
            gastos: [],
            metas: [],
            extras: []
        };
        salvarDados();
        atualizarResumo();
        atualizarGrafico();
    }
}

// ============================
// MENU RESPONSIVO
// ============================

// Alterna classes CSS para abrir/fechar menu responsivo
const menu = document.getElementById("menu");
const icone = document.getElementById('navIco');
const item = document.getElementById('itemContainer');

icone.addEventListener('click', function () {
    menu.classList.toggle("afterNav");
    menu.classList.toggle("beforeNav");
    icone.classList.toggle("afterImg");
    icone.classList.toggle("beforeImg");
    item.classList.toggle("afterItem");
    item.classList.toggle("beforeItem");
});
