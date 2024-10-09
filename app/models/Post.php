<?php


namespace Application\models;

use Application\abstract\PostAbstract;

class Post extends PostAbstract
{
    public function __construct($data = [])
    {
        $this->applyData($data, PostAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}