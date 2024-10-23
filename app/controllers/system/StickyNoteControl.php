<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\StickyNote;

class StickyNoteControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = StickyNote::class;
    protected $TABLE_NAME = "sticky_notes";
    protected $TABLE_PRIMARY_ID = "sticky_note_id";
    protected $SEARCH_LOOKUP = ["content"];

    public function add($stickyNotes, $section_id, $professor_id)
    {
        global $SESSION, $APPLICATION;

        foreach ($stickyNotes as $stickyNote) {
            $stickyNote['section_id'] = $section_id;
            $stickyNote['professor_id'] = $professor_id;
            $stickyNote['user_id'] = $SESSION->user_id;

            unset($stickyNote['id']);
            unset($stickyNote['creator_name']);
            unset($stickyNote['creator_image']);

            if ($stickyNote['status'] === 'created') {
                unset($stickyNote['sticky_note_id']);

                $this->addRecord($stickyNote);
            } else if ($stickyNote['status'] === 'edited') {
                $id = $stickyNote['sticky_note_id'];

                unset($stickyNote['sticky_note_id']);

                $this->editRecord($id, $stickyNote);
            } else if ($stickyNote['status'] === 'deleted') {
                $this->removeRecord($stickyNote['sticky_note_id']);
            }
        }

        return $this->filterRecords(['section_id' => $section_id, 'professor_id' => $professor_id], true);
    }
}