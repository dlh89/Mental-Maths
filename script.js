const form = document.querySelector('.js-start-form');
const formFields = Array.from(form.elements)

// Load form preferences from localStorage
formFields.forEach(function(field) {
    if (field.type !== 'checkbox') {
        return;
    }

    const savedValue = localStorage.getItem(field.id)
    if (savedValue === 'false') {
        field.checked = false;
    }
});

form.addEventListener('change', function(e) {
    localStorage.setItem(e.target.id, e.target.checked);
});