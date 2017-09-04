module.exports = Login;

Login.$inject = [];
function Login() {
    return {
        restrict: 'E',
        scope: {},
        controller: LoginController,
        template: require('./login.html')
    };
}
LoginController.$inject = [
    '$scope',
    'Authentication',
    'PasswordReset',
    '$location',
    'ConfigEndpoint',
    'ModalService'
];
function LoginController(
    $scope,
    Authentication,
    PasswordReset,
    $location,
    ConfigEndpoint,
    ModalService
) {
    $scope.email = '';
    $scope.password = '';
    $scope.failed = false;
    $scope.processing = false;
    $scope.loginSubmit = loginSubmit;
    $scope.cancel = cancel;
    $scope.forgotPassword = forgotPassword;
    $scope.showCancel = false;

    activate();

    function activate() {
        // If we're already logged in
        if (Authentication.getLoginStatus()) {
            $scope.$parent.closeModal();
        }

        ConfigEndpoint.get({id: 'site'}, function (site) {
            $scope.showCancel = !site.private;
        });
    }

    function clearLoginForm() {
        $scope.failed = true;
        $scope.processing = false;
        $scope.email = '';
        $scope.password = '';
    }

    function cancel() {
        clearLoginForm();
        $scope.$parent.closeModal();
    }

    function finishedLogin() {
        $scope.failed = false;
        $scope.processing = false;
        $scope.$parent.closeModal();
        if ($scope.email === 'admin') {
            redirectAdminEmailToAccountSettings();
        }
    }

    /**
     * redirectAdminEmailToAccountSettings is called when there is a login with the 'admin' email instead of a proper email.
     * This is part of an effort to force users to have proper emails and not use the default email/password combination that the
     * system had during the setup process.
     * references https://github.com/ushahidi/platform/issues/1714
     */
    function redirectAdminEmailToAccountSettings() {
        ModalService.openTemplate('<account-settings admin-user-setup="true"></account-settings>', 'Change your email and password', false, false, false, false);
    }

    function loginSubmit(email, password) {
        $scope.processing = true;

        Authentication
            .login(email, password)
            .then(finishedLogin, clearLoginForm);
    }

    function forgotPassword() {
        PasswordReset.openReset();
    }

}
