/*global applicationJSON */
(function () {
    var SUBMITTING_CSS_CLASS="submitting";
    var getValidMethod = function (method) {
        if (method) {
            var proposedMethod = method.toUpperCase();

            if (['GET', 'POST', 'PUT', 'PATCH'].indexOf(proposedMethod) >= 0) {
                return proposedMethod;
            }
        }
        return null;
    };
    xtag.register('form-ajax', {
        extends: 'form',
        events: {
            'click:delegate(button[type=submit])': function (event) {
                var form = this.form;
                if (!form.hiddenSubmitEl) {
                    form.hiddenSubmitEl = document.createElement('input');
                    form.hiddenSubmitEl.setAttribute('type', 'hidden');
                    form.appendChild(form.hiddenSubmitEl);
                }
                form.hiddenSubmitEl.setAttribute('name', this.name);
                form.hiddenSubmitEl.setAttribute('value', this.value);
            },
            'submit': function (event) {
                event.preventDefault();
                event.stopPropagation();
                if(!this.validate()){
                    return false;
                }
                if(this.classList.contains(SUBMITTING_CSS_CLASS)){
                    alert("please wait...");
                    return false;
                }
                this.classList.add(SUBMITTING_CSS_CLASS);
                var method = getValidMethod(this.getAttribute('method'));
                if (!method) {
                    throw new Error('Invalid method!');
                }
                var action = this.getAttribute('action');
                if (!action) {
                    throw new Error('Invalid action!');
                }
                var form = this;
                if (this.getAttribute("enctype") === "application/json") {
                    var rettpl=null;
                    if(this.getAttribute("proporder")!==null && this.getAttribute("proporder").trim!==""){
                        rettpl={};
                        var order=this.getAttribute("proporder").split(",");
                        for (var i=0; i<order.length; i++ ) {
                            var parts=order[i].trim().split(".");
                            if(rettpl[parts[0]]===undefined){
                                rettpl[parts[0]]={};
                            }
                            rettpl[parts[0]][parts[1]]=undefined;
                        }
                    }
                    //console.log(JSON.stringify(rettpl));
                    applicationJSON(this, function (json) {
                        if(form.hiddenSubmitEl) {
                            form.hiddenSubmitEl.removeAttribute("name");
                        }
                        var request = new XMLHttpRequest();
                        request.onreadystatechange = function () {
                            if (request.readyState === 4) {
                                xtag.fireEvent(form, 'submitted', {detail: {request: request, data: json}});
                                form.classList.remove(SUBMITTING_CSS_CLASS);
                            }
                        };
                        request.open(method, action, true);
                        request.setRequestHeader('Content-Type', "application/json");
                        request.send(JSON.stringify(json, null, 4));
                    },rettpl);
                }
            }
        },
        methods: {
            validate: function() {
                return true;
            }
        }
    });
})();