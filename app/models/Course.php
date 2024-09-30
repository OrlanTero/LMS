<?php


namespace Application\models;

use Application\abstract\CourseAbstract;

class Course extends CourseAbstract
{
    public function __construct($data = [])
    {
        $this->applyData($data, CourseAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}