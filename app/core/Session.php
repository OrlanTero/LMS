<?php

namespace Application\core;

use Application\abstract\UserAbstract;
use Application\abstract\UserProfileAbstract;
use Application\models\User;

class Session extends UserAbstract
{
    public $hasUser = false;
    public $isAdmin = false;
    public $photoURL;

    public $typeName;

    public function __construct()
    {
        $this->hasUser = isset($_SESSION['user_id']);

    }

    public function update()
    {
        global $ALL_USER_TYPES_MINI;

        $this->typeName = $ALL_USER_TYPES_MINI[$this->user_type - 1];
    }

    public function apply($user): void
    {
        global $USER_TYPES_TEXT;

        $vars = get_class_vars(UserAbstract::class);

        foreach (array_keys($vars) as $var) {
            if (property_exists($user, $var)) {
                $this->{$var} = $user->{$var};
            }
        }
    }

    public function getPhotoURL()
    {
        $EXTENSION = 'jpg';
        $CHARACTER_AVATAR_PATH = '/public/assets/media/avatar/';

        return strlen($this->image) > 0 ? $this->image : $CHARACTER_AVATAR_PATH . strtoupper($this->displayName[0]) . '.' . $EXTENSION;
    }

    public function start(): void
    {
        $_SESSION["user_id"] = $this->user_id;
        $_SESSION["is_admin"] = true;
        $_SESSION["session"] = $this;

        $this->isAdmin = $_SESSION["is_admin"];
        $this->hasUser = isset($_SESSION["user_id"]);

        $this->update();
    }

    public function logout()
    {
        global $KLEIN;

        $_SESSION['session'] = null;

        session_destroy();

        $KLEIN->response()->redirect('/login');
    }
}