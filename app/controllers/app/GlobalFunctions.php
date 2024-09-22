<?php

namespace Application\controllers\app;

use Application\controllers\system\PostControl;
use Application\controllers\system\UserControl;

class GlobalFunctions
{
    protected $CONNECTION;
    protected $KLEIN;
    protected $SESSION;
    public $isAdmin;

    public $EMAIL_CONTROL;

    public $POST_CONTROL;

    public $USER_CONTROL;

    public function __construct($SESSION)
    {
        global $CONNECTION;
        global $KLEIN;

        $this->SESSION = $SESSION;
        $this->CONNECTION = $CONNECTION;
        $this->KLEIN = $KLEIN;
        $this->isAdmin = $SESSION->isAdmin;

        $this->EMAIL_CONTROL = new EmailControl();

        $this->POST_CONTROL = new PostControl();

        $this->USER_CONTROL = new UserControl();
    }
}