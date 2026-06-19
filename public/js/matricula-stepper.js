function nextStep(stepNumber) {
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

function finalizarMatricula() {
    Swal.fire({
        title: 'Sucesso!',
        text: 'Matrícula efetuada com sucesso!',
        icon: 'success',
        confirmButtonColor: '#7b61ff'
    }).then(() => {
        // Redirecionar para o perfil do aluno (Captura 26) ou tela principal
        window.location.href = '/'; // TODO: Rota para o perfil
    });
}
