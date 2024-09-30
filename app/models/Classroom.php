<?php


namespace Application\models;

use Application\abstract\ClassRoomAbstract;

class Classroom extends ClassRoomAbstract
{
    public function __construct($data = [])
    {
        $this->applyData($data, ClassRoomAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}