<?php


namespace Application\models;

use Application\abstract\PostAbstract;

class Post extends PostAbstract
{

    public $author;

    public $medias;

    public function __construct($data = [])
    {
        $this->applyData($data, PostAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->author = $APPLICATION->FUNCTIONS->USER_CONTROL->get($this->user_id, true);
        $this->medias = $APPLICATION->FUNCTIONS->POST_MEDIA_CONTROL->filterRecords(['post_id' => $this->post_id], true);

    }
}