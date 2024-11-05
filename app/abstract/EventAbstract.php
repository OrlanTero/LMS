<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class EventAbstract extends ModelDefaultFunctions
{
    public $event_id;

    public $user_id;

    public $date_start;

    public $date_end;

    public $title;

    public $poster;

    public $description;

    public $status;

    public $date_created;
}