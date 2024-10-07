<?php


namespace Application\models;

use Application\abstract\DepartmentAbstract;

class Department extends DepartmentAbstract
{
    public function __construct($data = [])
    {
        $this->applyData($data, DepartmentAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}