<?php


namespace Application\models;

use Application\abstract\CourseAbstract;
use Application\abstract\SectionAbstract;

class Section extends SectionAbstract
{
    public function __construct($data = [])
    {
        $this->applyData($data, SectionAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}