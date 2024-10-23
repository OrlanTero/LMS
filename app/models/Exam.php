<?php


namespace Application\models;

use Application\abstract\ExamAbstract;

class Exam extends ExamAbstract
{

    public function __construct($data = [])
    {
        $this->applyData($data, ExamAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;
    }
}