<?php


namespace Application\models;

use Application\abstract\PostMediaAbstract;

class PostMedia extends PostMediaAbstract
{
    public function __construct($data = [])
    {
        $this->applyData($data, PostMediaAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}