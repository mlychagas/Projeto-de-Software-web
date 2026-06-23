function nextStep(stepNumber) {
    // Validate Step 1 before moving to Step 2
    if (stepNumber === 2) {
        const requiredIds = ['respNome', 'respCpf', 'respNascimento', 'respEmail', 'respTelefone'];
        let hasError = false;
        
        for (const id of requiredIds) {
            const el = document.getElementById(id);
            if (!el.value.trim()) {
                el.classList.add('is-invalid');
                hasError = true;
            } else {
                el.classList.remove('is-invalid');
            }
        }

        if (hasError) {
            if (typeof Swal !== 'undefined') {
                Swal.fire('Campos Obrigatórios', 'Preencha todos os campos obrigatórios marcados com *', 'warning');
            }
            return; // Bloqueia a navegação
        }
    }

    // Hide all steps
    document.querySelectorAll('.step-content').forEach(el => el.style.display = 'none');
    
    // Show target step
    document.getElementById('step-' + stepNumber).style.display = 'block';

    // Update progress bar UI
    document.querySelectorAll('.step').forEach((el, index) => {
        if (index < stepNumber) {
            el.classList.add('active');
            el.style.background = '#e8e6fb';
            el.style.color = '#7b61ff';
        } else {
            el.classList.remove('active');
            el.style.background = '#f8f9fa';
            el.style.color = '#999';
        }
    });
}

function prevStep(stepNumber) {
    nextStep(stepNumber);
}

function buscarCep() {
    let cep = document.getElementById('respCep').value.replace(/\D/g, '');
    if (cep !== "") {
        let validacep = /^[0-9]{8}$/;
        if(validacep.test(cep)) {
            document.getElementById('respLogradouro').value = "...";
            document.getElementById('respBairro').value = "...";
            document.getElementById('respCidade').value = "...";
            document.getElementById('respEstado').value = "...";

            fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(res => res.json())
            .then(dados => {
                if (!("erro" in dados)) {
                    document.getElementById('respLogradouro').value = dados.logradouro;
                    document.getElementById('respBairro').value = dados.bairro;
                    document.getElementById('respCidade').value = dados.localidade;
                    document.getElementById('respEstado').value = dados.uf;
                } else {
                    Swal.fire('Erro', 'CEP não encontrado.', 'error');
                }
            })
            .catch(error => Swal.fire('Erro', 'Falha ao buscar o CEP.', 'error'));
        } else {
            Swal.fire('Aviso', 'Formato de CEP inválido.', 'warning');
        }
    }
}

function atualizarConfirmacao() {
    const logradouro = document.getElementById('respLogradouro').value;
    const numero = document.getElementById('respNumero').value;
    const bairro = document.getElementById('respBairro').value;
    const cidade = document.getElementById('respCidade').value;
    const estado = document.getElementById('respEstado').value;
    
    let enderecoStr = "";
    if (logradouro) enderecoStr += logradouro;
    if (numero) enderecoStr += `, ${numero}`;
    if (bairro) enderecoStr += ` - ${bairro}`;
    if (cidade && estado) enderecoStr += `, ${cidade}/${estado}`;

    document.getElementById('confRespNome').textContent = document.getElementById('respNome').value;
    document.getElementById('confRespCpf').textContent = document.getElementById('respCpf').value;
    document.getElementById('confRespRg').textContent = document.getElementById('respRg').value;
    document.getElementById('confRespTelefone').textContent = document.getElementById('respTelefone').value;
    document.getElementById('confRespEndereco').textContent = enderecoStr;
}

// Atualizar tela de confirmação quando entra nela
const originalNextStep = window.nextStep || nextStep;
window.nextStep = function(stepNumber) {
    originalNextStep(stepNumber);
    if (stepNumber === 5) {
        atualizarConfirmacao();
    }
}

function finalizarMatricula() {
    const alunoId = document.getElementById('alunoId').value;
    const pronomeEl = document.querySelector('input[name="pronome"]:checked');
    
    const payload = {
        alunoId: alunoId,
        responsavel: {
            nome: document.getElementById('respNome').value,
            cpf: document.getElementById('respCpf').value,
            rg: document.getElementById('respRg').value,
            pronome: pronomeEl ? pronomeEl.value : null,
            dataNascimento: document.getElementById('respNascimento').value,
            email: document.getElementById('respEmail').value,
            telefone: document.getElementById('respTelefone').value,
            cep: document.getElementById('respCep').value,
            logradouro: document.getElementById('respLogradouro').value,
            numero: document.getElementById('respNumero').value,
            complemento: document.getElementById('respComplemento').value,
            bairro: document.getElementById('respBairro').value,
            cidade: document.getElementById('respCidade').value,
            estado: document.getElementById('respEstado').value
        }
    };

    Swal.fire({
        title: 'Finalizando...',
        text: 'Aguarde enquanto registramos os dados do seu cadastro.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    fetch('/matricula/api/cadastro-finalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            Swal.fire({
                title: 'Tudo Certo! ✅',
                text: 'Cadastro concluído com sucesso. Bem-vindo!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = '/'; 
            });
        } else {
            Swal.fire('Erro', data.message, 'error');
        }
    })
    .catch(err => Swal.fire('Erro', 'Falha na comunicação com o servidor.', 'error'));
}
