var formParameters = [
    {id: 'sct1', title: 'Contact', questions: [
        {id: 1, label: 'Nom', control: 'input', placeholder: 'Nom Prénom', validate: 'required|alpha|min:2', icon: "icon-user-1" },
        {id: 2, label: 'E-mail', control: 'input', placeholder: 'spongebob@exemple.fr', validate: 'required|email', icon: "icon-mail"}
    ]},
    {id: 'sect2', title: 'Projet', questions: [
        {id: 3, label: 'Intitulé', control: 'input', placeholder: 'titre', validate: 'required|min:2', icon: "icon-tag-1"},
        {id: 4, label: 'Description', control: 'textarea', placeholder: 'secteur d\'activité, technologies, ...', validate: 'required|min:2', icon: "icon-doc-inv"},
        {id: 5, label: 'Objectifs', control: 'textarea', placeholder: 'liste des objectifs', validate: 'required|min:2', icon: "icon-target-1"},
        {id: 7, label: 'Documents', control: 'input-file', icon: "icon-folder"}
    ]}
];

function questionTemplate(customField) {
    return '<div :class="{\'input\':true,\'has-error\':errors.has(question.label)}">' +
        customField +
        '<label :for="question.id" class="control-label"><i :class="question.icon"></i> {{question.label}} ' +
        '<em v-show="question.validate">*</em></label>' +
        '<span v-show="errors.has(question.label)" class="small help-block">{{errors.first(question.label)}}</span></div>';
}

Vue.component('form-input', {
    props: ['question'],
    template: questionTemplate('<input :id="question.id" :name="question.label" ' +
        ':class="{\'input\':true,\'has-error\':errors.has(question.label)}" ' +
        'class="form-control" type="text" ' +
        'v-model="question.answer" :placeholder="question.placeholder" v-validate="question.validate" />')
});

Vue.component('form-input-file', {
    props: ['question'],
    template: '<span class="btn btn-default btn-file">Parcourir ... ' +
        '<input :id="question.id" :name="question.label" class="form-control" type="file" ' +
        ':placeholder="question.placeholder" accept=".xls,image/*,.doc,.ppt,.txt,.pdf" hidden ' +
        '@change="filesChange($event.target.files)"' +
        '/></span>',
    methods: {
        filesChange: function (fileList) {
            if (!fileList.length) return;
            console.log(fileList.length + " " + fileList[0].name);
            this.question.answer = [
                {'name': fileList[0].name, 'file': fileList[0]}
            ];
        }
    }
});

Vue.component('form-textarea', {
    props: ['question'],
    template: questionTemplate('<textarea :id="question.id" :name="question.label" class="form-control" ' +
        ':class="{\'input\':true,\'has-error\':errors.has(question.label)}" ' +
        'v-model="question.answer" :placeholder="question.placeholder" v-validate="question.validate" />')
});

Vue.component('form-question', {
    props: ['question'],
    created: function () {
        this.$options.template = '<div class="form-group">';
        switch (this.question.control) {
            case 'input':
                this.$options.template += '<form-input :question="question"></form-input>';
                break;
            case 'input-file':
                this.$options.template += '<div class="input"><label :for="question.id" class="control-label">'+
                    '<i :class="question.icon"></i> {{question.label}} </label>';
                this.$options.template += '<form-input-file :question="question"></form-input-file></div>';
                break;
            case 'textarea':
                this.$options.template += '<form-textarea :question="question"></form-textarea>';
                break;
        }
        this.$options.template += '</div>';
    }
});

Vue.component('form-section', {
    props: ['section'],
    created: function () {
        this.$options.template = '<div class="section row"><h3 class="text-center">{{section.title}}</h3>' +
            '<div class="col-md-12"><form-question v-for="question in section.questions" :question="question" :key="question.id">' +
            ' </form-question></div></div>'
    }
});

const config = {
    locale: 'fr'
};

Vue.use(VeeValidate, config);

var app = new Vue({
    el: '#quotationForm',
    data: {
        sections: formParameters
    },
    methods: {
        submitForm: function (event) {
            var $this = this;
            var $validator = this.$validator;
            var data = {};
            this.sections.forEach(function (section) {
                section.questions.forEach(function (question) {
                    if (question.validate !== undefined) {
                        $validator.attach(question.label, question.validate);
                        data[question.label] = question.answer;
                    }
                });
            });

            var $sections = this.sections;
            $validator.validateAll(data).then(function () {
                var form = [];
                $sections.forEach(function (section) {
                    section.questions.forEach(function (question) {
                        form.push({
                            id: question.id,
                            label: question.label,
                            answer: question.answer
                        })
                    });
                });
                console.log(JSON.stringify(form));
            }).catch(function (error) {
                    $this.$children.forEach(function (child) {
                        child.$children.forEach(function (child) {
                            child.$children.forEach(function (child) {
                                child.$validator.validateAll().then(function () {
                                }).catch(function () {
                                    });
                            });
                        });
                    });
                    console.log('Invalid form. Error count : ' + $validator.getErrors().count());
                });
        }
    }
});


