/*global applicationJSON */
(function () {
    var getValidMethod = function (method) {
        if (method) {
            var proposedMethod = method.toUpperCase();

            if (['GET', 'POST', 'PUT', 'PATCH'].indexOf(proposedMethod) >= 0) {
                return proposedMethod;
            }
        }
        return null;
    };
    xtag.addEvent(document, 'submit:delegate(form[data-x-tag=x-tag-form-ajax])', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var method = getValidMethod(this.getAttribute('method'));
        if (!method) {
            throw new Error('Invalid method!');
        }
        var action = this.getAttribute('action');
        if (!action) {
            throw new Error('Invalid action!');
        }
        var form=this;
        if (this.getAttribute("enctype") === "application/json") {
            applicationJSON(this, function (json) {
                var request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (request.readyState === 4) {
                        xtag.fireEvent(form, 'submitted', { detail: { request: request}});
                    }
                };
                request.open(method, action, true);
                request.setRequestHeader('Content-Type', "application/json");
                request.send(JSON.stringify(json, null, 4));
            });
        }
    });

})();