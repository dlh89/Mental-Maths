export class GameSettings
{
    constructor() {
        const form = document.querySelector('.js-start-form');
        if (!form) {
            return;
        }
        const formFields = Array.from(form.elements)
    
        // Load form preferences from localStorage
        formFields.forEach(function(field) {
            if (field.type !== 'checkbox') {
                return;
            }
    
            const savedValue = localStorage.getItem(field.id)
            if (savedValue) {
                field.checked = savedValue === 'false' ? false : true;
            }
        });
    
        form.addEventListener('change', function(e) {
            localStorage.setItem(e.target.id, e.target.checked);
        });
    
        const parentFields = document.querySelectorAll('.js-parent-field');
    
        parentFields.forEach(parent => {
            this.handleDisableChildren(parent); 
    
            parent.addEventListener('change', e => {
                this.handleDisableChildren(e.target); 
            });
        });
    
        const startForm = document.querySelector('.js-start-form');
    
        startForm.addEventListener('submit', function(e) {
            let isQuestionTypeSelected = false;
            const questionTypeCheckboxes = document.querySelectorAll('[name="question_types"]');
            questionTypeCheckboxes.forEach(function(questionTypeCheckbox) {
                if (questionTypeCheckbox.checked) {
                    const childCheckboxes = Array.from(questionTypeCheckbox.parentNode.querySelectorAll('[type="checkbox"]'))
                                            .filter(item => item !== questionTypeCheckbox);
                    childCheckboxes.forEach(function(childCheckbox) {
                        if (childCheckbox.checked) {
                            isQuestionTypeSelected = true;
                        }
                    });
                }
            });
    
            if (!isQuestionTypeSelected) {
                e.preventDefault();
                alert('Please select at least one question type.');
            }
        });
    }

    handleDisableChildren(parent) {
        const children = parent.closest('div').querySelectorAll('.js-child-field');
            
        children.forEach(function(child) {
            if (parent.checked) {
                child.removeAttribute('disabled');
            } else {
                child.setAttribute('disabled', true);
            }
        });
    }
}

const gameSettings = new GameSettings();