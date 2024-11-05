<?php


namespace Application\models;

use Application\abstract\EventAbstract;

class Event extends EventAbstract
{
    public function __construct($data = [])
    {
        $this->applyData($data, EventAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}