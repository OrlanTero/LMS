<?php


namespace Application\models;

use Application\abstract\PostLikeAbstract;

class PostLike extends PostLikeAbstract
{

    public function __construct($data = [])
    {
        $this->applyData($data, PostLikeAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;
    }
}