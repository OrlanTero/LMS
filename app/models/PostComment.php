<?php


namespace Application\models;

use Application\abstract\PostCommentAbstract;

class PostComment extends PostCommentAbstract
{

    public $author;

    public function __construct($data = [])
    {
        $this->applyData($data, PostCommentAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->author = $APPLICATION->FUNCTIONS->USER_CONTROL->get($this->user_id, true);
    }
}