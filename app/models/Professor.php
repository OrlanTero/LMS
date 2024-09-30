<?php


namespace Application\models;

use Application\abstract\ProfessorAbstract;

class Professor extends ProfessorAbstract
{
    public function __construct($data = [])
    {
        $this->applyData($data, ProfessorAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}