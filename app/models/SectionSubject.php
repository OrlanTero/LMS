<?php


namespace Application\models;

use Application\abstract\SectionSubjectAbstract;

class SectionSubject extends SectionSubjectAbstract
{

    public $subject;

    public $professor;

    public $schedule;

    public $schedule_label;
    public function __construct($data = [])
    {
        $this->applyData($data, SectionSubjectAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->subject = $APPLICATION->FUNCTIONS->SUBJECT_CONTROL->get($this->subject_id, true);

        $this->professor = $APPLICATION->FUNCTIONS->PROFESSOR_CONTROL->get($this->professor_id, true);

        if ($this->schedule_id != 0) {
            $this->schedule = $APPLICATION->FUNCTIONS->SCHEDULE_CONTROL->get($this->schedule_id, true);

            if($this->schedule) {
                $this->schedule_label = $this->schedule->schedule_label;
            }

        }
    }
}