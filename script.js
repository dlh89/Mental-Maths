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

const parentFields = document.querySelectorAll('.js-parent-field');

parentFields.forEach(function(parent) {
    handleDisableChildren(parent); 

    parent.addEventListener('change', function(e) {
       handleDisableChildren(e.target); 
    });
});

function handleDisableChildren(parent) {
    const children = parent.closest('div').querySelectorAll('.js-child-field');
        
    children.forEach(function(child) {
        if (parent.checked) {
            child.removeAttribute('disabled');
        } else {
            child.setAttribute('disabled', true);
        }
    });
}