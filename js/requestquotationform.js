var formParameters = [
    {id: 1, label: 'Nom', type: 'input' },
    {id: 2, label: 'E-mail', type: 'input'},
    {id: 3, label: 'Intitulé', type: 'input'},
    {id: 4, label: 'Desciption', type: 'textarea', placeholder: 'secteur d\'activité, technologies, ...'},
    {id: 5, label: 'Objectifs', type: 'textarea'}
];

Vue.component('form-input', {
    props: ['question'],
    template: '<input :id="question.id" :name="question.label" class="form-control" type="text" ' +
        'v-model="question.answer" :placeholder="question.placeholder"/>'
});

Vue.component('form-textarea', {
    props: ['question'],
    template: '<textarea :id="question.id" :name="question.id" class="form-control" type="text" ' +
        'v-model="question.answer" :placeholder="question.placeholder"/>'
});

Vue.component('form-question', {
    props: ['question'],
    created: function () {
        this.$options.template = '<div class="form-group">' +
            '<label :for="question.id" class="control-label">{{question.label}}</label>';
        switch (this.question.type) {
            case 'input':
                this.$options.template += '<form-input :question="question"></form-input>';
                break;
            case 'textarea':
                this.$options.template += '<form-textarea :question="question"></form-textarea>';
                break;
        }
        this.$options.template += '</div>';
    }
});

var app = new Vue({
    el: '#quotationForm',
    data: {
        questions: formParameters
    }/*,
     created: function () {
     this.questions.push(formParameters);
     }*/
});