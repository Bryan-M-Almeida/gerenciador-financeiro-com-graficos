const forms = [
    { id: 'rendaForm', inputs: ['.rendaInput'] },
    { id: 'metaForm', inputs: ['.metaInput'] },
    { id: 'gastoForm', inputs: ['.valorGastosInput', '.descricaoGastosInput'] }
];

forms.forEach(({ id, inputs }) => {
    const form = document.getElementById(id);
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        inputs.forEach(selector => {
            const input = document.querySelector(selector);
            if (input) input.value = "";
        });
        console.log(`Formulário ${id} enviado sem recarregar`);
    });
});

const dados = {
    renda: "",
    gastos: "",
    metas: {
        valor: "",
        descricao: ""
    }
};
