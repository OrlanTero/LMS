<?php


namespace Application\models;

use Application\abstract\PostAbstract;

class Post extends PostAbstract
{

    public $author;

    public $medias;

    public $isLiked;

    public $likes;
    public function __construct($data = [])
    {
        $this->applyData($data, PostAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION, $SESSION;

        $this->author = $APPLICATION->FUNCTIONS->USER_CONTROL->get($this->user_id, true);
        $this->medias = $APPLICATION->FUNCTIONS->POST_MEDIA_CONTROL->filterRecords(['post_id' => $this->post_id], true);
        $this->isLiked = $APPLICATION->FUNCTIONS->POST_LIKE_CONTROL->alreadyExists([
            "post_id" => $this->post_id,
            "user_id" => $SESSION->user_id
        ])->code == 200;
        $this->likes = $APPLICATION->FUNCTIONS->POST_LIKE_CONTROL->getPostLikes($this->post_id);
    }
}