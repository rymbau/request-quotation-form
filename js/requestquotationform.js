var formParameters = [
    {id: 'sect1', title: 'Contact', questions: [
        {id: 1, label: 'Nom', control: 'input', placeholder: 'Nom Prénom', validate: 'required|alpha|min:2', icon: 'icon-user-1', answer: ''},
        {id: 2, label: 'E-mail', control: 'input', placeholder: 'spongebob@exemple.fr', validate: 'required|email', icon: 'icon-mail', answer: ''}
    ]},
    {id: 'sect2', title: 'Projet', questions: [
        {id: 3, label: 'Intitulé', control: 'input', placeholder: 'titre', validate: 'required|min:2', icon: "icon-tag-1", answer: ''},
        {id: 4, label: 'Description', control: 'textarea', placeholder: 'secteur d\'activité, technologies, ...', validate: 'required|min:2', icon: 'icon-doc-inv', answer: ''},
        {id: 5, label: 'Objectifs', control: 'textarea', placeholder: 'liste des objectifs', validate: 'required|min:2', icon: 'icon-target-1', answer: ''},
        {id: 7, label: 'Documents', control: 'input-file', icon: 'icon-folder'}
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
    template: questionTemplate('<input :id="question.id" :name="question.label" ref="input" ' +
        ':class="{\'input\':true,\'has-error\':errors.has(question.label)}" ' +
        'class="form-control" type="text" ' +
        'v-model="question.answer" :placeholder="question.placeholder" v-validate="question.validate" />'),
    mounted: function () {
        bus.$on('reset', this.reset);
        bus.$on('validate', this.validate);
    },
    methods: {
        reset: function () {
            var $this = this;
            $this.question.answer = '';
            setTimeout(function () {
                $this.errors.clear();
            }, 100);
        },
        validate: function () {
            this.$validator.validateAll().then(function () {
            }).catch(function () {
                });
        }
    }
});

Vue.component('form-input-file', {
    props: ['question'],
    data: function () {
        return {fileList: [], uploadError: false};
    },
    created: function () {
        bus.$on('reset', this.fileReset);
        bus.$on('submit', this.fileDisable);
    },
    template: '<div class="input" :class="{\'has-error\':uploadError}"><label :for="question.id" class="control-label">' +
        '<i :class="question.icon"></i> {{question.label}} </label>' +
        '<div class="dropbox v-center"  >' +
        '<input :id="question.id" :name="question.label" class="form-control input-file" type="file" ' +
        ':placeholder="question.placeholder" accept=".xls,image/*,.doc,.ppt,.txt,.pdf" multiple ' +
        ':class="{\'input\':true,\'has-error\':uploadError}"  ref="inputfile" ' +
        'v-on:change="fileChange($event,$event.target)" v-on:drop="fileChange($event,$event.dataTransfer)"/></span>' +
        '<span v-show="!fileList.length">Déposez les fichiers ici (txt, pdf, jpg, png, doc, ppt, xls)</span>' +
        '<ol><li v-for="(file,index) in fileList">{{file.name}} <i v-on:click="fileCancel(index)" class="icon-cancel"></i></li></ol>' +
        '</div>' +
        '<span v-show="uploadError" class="small help-block">Fichier(s) non valide(s).</span></div>',
    methods: {
        fileChange: function (event, target) {
            event.preventDefault();
            var files = target.files;

            if (!files.length) return;
            for (var i = 0; i < files.length; i++) {
                this.fileList.push(files[i]);
            }
        },
        fileCancel: function (index) {
            this.fileList.splice(index, 1);
        },
        fileValidate: function () {
            var $this = this;
            var regex = new RegExp("(.*?)\.(xls|png|jpg|doc|ppt|txt|pdf)$");
            for (var i = 0; i < $this.fileList.length; i++) {
                var ext = $this.fileList[i].name.toLowerCase();
                if (!(regex.test(ext))) {
                    $this.uploadError = true;
                    return $this.uploadError;
                }
            }
            this.uploadError = false;
            return this.uploadError;
        },
        fileReset: function () {
            this.fileList = [];
            this.uploadError = false;
        },
        fileDisable: function (disable) {
            this.$refs.inputfile.disabled = disable;
        }
    },
    watch: {
        'fileList': function () {
            this.fileValidate();
            bus.$emit('updateUploadFiles', this.fileList);
        },
        'uploadError': function () {
            bus.$emit('updateUploadValidate', this.uploadError);
        }
    }
});

Vue.component('form-textarea', {
    props: ['question'],
    template: questionTemplate('<textarea :id="question.id" :name="question.label" class="form-control" ' +
        ':class="{\'input\':true,\'has-error\':errors.has(question.label)}" ' +
        'v-model="question.answer" :placeholder="question.placeholder" v-validate="question.validate" />'),
    mounted: function () {
        bus.$on('reset', this.reset);
        bus.$on('validate', this.validate);
    },
    methods: {
        reset: function () {
            var $this = this;
            $this.question.answer = '';
            setTimeout(function () {
                $this.errors.clear();
            }, 100);
        },
        validate: function () {
            this.$validator.validateAll().then(function () {
            }).catch(function () {
                });
        }
    }
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

var bus = new Vue();

var app = new Vue({
    el: '#quotationForm',
    data: {
        sections: formParameters,
        loading: false,
        result: null,
        upload: true,
        uploadFiles: []
    },
    created: function () {
        bus.$on('updateUploadFiles', function (fileList) {
            app.uploadFiles = fileList;
        });
        bus.$on('updateUploadValidate', function (uploadError) {
            app.upload = !uploadError;
        });

    },
    mounted: function () {
        this.reset();
    },
    methods: {
        reset: function () {
            this.errors.clear();
            bus.$emit('reset');
        },
        submitForm: function (event) {
            event.preventDefault();
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
                if ($this.upload) {
                    $this.loading = true;
                    bus.$emit('submit', true);

                    var formData = new FormData($this.$el);

                    $this.uploadFiles.forEach(function (file) {
                        formData.append("Documents[]", file, file.name);
                    });

                    $this.$http.post('php/send_mail.php', formData).then(function (response) {
                        console.log(response.body);
                        $this.result = 'Message envoyé.';
                        $this.reset();
                    },function (response) {
                        console.log('Error submit ');
                        $this.result = 'Une erreur est survenue.';
                    }).then(function () {
                            $this.loading = false;
                            bus.$emit('submit', false);
                        });
                }
            }).catch(function (error) {
                    bus.$emit('validate');
                    console.log(error);
                    $this.result = ($validator.getErrors().count()) ? 'Erreur de validation du formulaire.' : 'Une erreur est survenue.';
                    $this.loading = false;
                    bus.$emit('submit', false);
                });
        }
    }
});

document.addEventListener('dragover', function (event) {
    event.preventDefault();
    event.stopPropagation();
});
