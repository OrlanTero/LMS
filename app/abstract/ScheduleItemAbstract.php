<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class ScheduleItemAbstract extends ModelDefaultFunctions
{
    public $schedule_item_id;

    public $schedule_id;

    public $day;

    public $start_time;

    public $end_time;

    public $date_created;

    public $status;
}