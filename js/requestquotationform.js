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
    data: function () {
        return {fileList: []};
    },
    template: '<div class="input"><label :for="question.id" class="control-label">' +
        '<i :class="question.icon"></i> {{question.label}} </label>' +
        '<div class="dropbox v-center">' +
        '<input :id="question.id" :name="question.label" class="form-control input-file" type="file" ' +
        ':placeholder="question.placeholder" accept=".xls,image/*,.doc,.ppt,.txt,.pdf" multiple ' +
        'v-on:change="filesChange" v-on:drop="filesDrop"/></span>' +
        '<span v-show="!fileList.length">Déposez les fichiers ici (txt, pdf, jpg, png, doc, ppt, xls)</span>' +
        '<ol><li v-for="(file,index) in fileList">{{file.name}} <i v-on:click="fileCancel(index)" class="icon-cancel"></i></li></ol>' +
        '</div></div>',
    methods: {
        filesChange: function (event) {
            event.preventDefault();
            var files = event.target.files;
            
            if (!files.length) return;
            // this.fileList = this.fileList.concat(Array.from(event.target.files));
            for (var i = 0; i < files.length; i++) {
                this.fileList.push(files[i]);
            }
            app.$el.documents = this.fileList;
        },
        fileCancel: function (index) {
            this.fileList.splice(index, 1);
            app.$el.documents = this.fileList;
        },
        filesDrop: function (event) {
            event.preventDefault();
            var files = event.dataTransfer.files;
            for (var i = 0; i < files.length; i++) {
                this.fileList.push(files[i]);
            }
            app.$el.documents = this.fileList;
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
                this.$options.template += '<form-input-file :question="question"></form-input-file>';
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
        sections: formParameters,
        loading: false,
        result: null
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

            $validator.validateAll(data).then(function () {
                $this.loading = true;
                document.getElementById("7").disabled = true;

                var formData = new FormData($this.$el);

                $this.$el.documents.forEach(function (file) {
                    formData.append("Documents[]", file, file.name);
                });

                $this.$http.post('php/send_mail.php', formData).then(function (response) {
                    console.log(response.body);
                    $this.result = 'Message envoyé.';
                },function (response) {
                    console.log('Error submit');
                    $this.result = 'Une erreur est survenue.';
                }).then(function () {
                        $this.loading = false;
                        document.getElementById("7").disabled = false;
                    });
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
                    console.log(error);
                    $this.result = null;
                    $this.loading = false;
                    document.getElementById("7").disabled = false;
                });
        }
    }
});

document.addEventListener("dragover", function(event) {
    event.preventDefault();
    event.stopPropagation();
});

