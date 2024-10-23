<?php


namespace Application\models;

use Application\abstract\StickyNoteAbstract;

class StickyNote extends StickyNoteAbstract
{

    public $creator;

    public $creator_name;

    public $creator_image;
    

    public function __construct($data = [])
    {
        $this->applyData($data, StickyNoteAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->creator = $APPLICATION->FUNCTIONS->USER_CONTROL->get($this->user_id, true);
        $this->creator_name = $this->creator->displayName;
        $this->creator_image = $this->creator->photoURL;
    }
}