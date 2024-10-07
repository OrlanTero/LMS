<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class ScheduleAbstract extends ModelDefaultFunctions
{
    public $schedule_id;

    public $id;

    public $description;

    public $date_created;

    public $status;
}