<?php


namespace Application\models;

use Application\abstract\SubjectAbstract;

class Subject extends SubjectAbstract
{
    public function __construct($data = [])
    {
        $this->applyData($data, SubjectAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}