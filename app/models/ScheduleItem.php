<?php


namespace Application\models;

use Application\abstract\ScheduleItemAbstract;

class ScheduleItem extends ScheduleItemAbstract
{
    public function __construct($data = [])
    {
        $this->applyData($data, ScheduleItemAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}